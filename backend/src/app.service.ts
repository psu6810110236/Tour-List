import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'; // เพิ่ม Filter สำหรับ Search
import { Role } from './entities/role.entity';
import { Province } from './entities/province.entity';
import { Tour } from './entities/tour.entity';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  //ทำงานอัตโนมัติเมื่อ Start Server
  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedUsers();
    const provinces = await this.seedProvinces();
    await this.seedTours(provinces);
  }

  // ======================================================
  // 🟢 ส่วนที่ 1: DATA RETRIEVAL (สำหรับ API เรียกใช้)
  // ======================================================

  // ดึงจังหวัดทั้งหมด
  async getAllProvinces() {
    return await this.provinceRepository.find();
  }

  // ดึงทัวร์ทั้งหมด
  async getAllTours() {
    return await this.tourRepository.find({
      order: {
        bookedSeats: 'DESC' // 🟢 เรียงยอดจอง (bookedSeats) จากมาก (DESC) ไปน้อย
      },
      take: 6, // 🟢 แนะนำให้แสดงแค่ 6 อันดับแรกบนหน้า Homepage ให้ดูพอดี
      relations: ['province'] // 🟢 (ถ้าต้องการ) ดึงข้อมูลจังหวัดมาแสดงผลด้วย
    });
  }

  // ดึงรายละเอียดทัวร์รายตัว
  async getTourById(id: number) {
    return await this.tourRepository.findOne({ where: { id } });
  }

  // ระบบ Search & Filter ทัวร์ (รองรับ Price, Province)
  async searchTours(query: { provinceId?: string; maxPrice?: number; minPrice?: number }) {
    const where: any = {};

    if (query.provinceId) where.provinceId = query.provinceId;
    if (query.maxPrice) where.price = LessThanOrEqual(query.maxPrice);
    if (query.minPrice) where.price = MoreThanOrEqual(query.minPrice);

    return await this.tourRepository.find({ where });
  }

  // ======================================================
  // 🟡 ส่วนที่ 2: DATA SEEDING (ใส่ข้อมูลเริ่มต้น)
  // ======================================================

  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      await this.roleRepository.save([{ name: 'ADMIN' }, { name: 'USER' }]);
      console.log('✅ Seeded Roles: ADMIN, USER');
    }
  }

  private async seedProvinces() {
    const count = await this.provinceRepository.count();
    // ถ้าข้อมูลมีน้อยกว่า 77 แปลว่ายังไม่ครบ ให้เพิ่มเข้าไป
    if (count < 77) {
      const provincesList = [
        "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
        "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
        "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
        "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
        "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
        "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
        "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา",
        "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
        "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
        "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
        "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
        "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
        "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
        "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
        "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
        "อุทัยธานี", "อุบลราชธานี"
      ];

      // ข้อมูล EN name + description แยกตามจังหวัด
      const provinceDetails: Record<string, { name_en: string; desc_th: string; desc_en: string; region: string }> = {
        "กรุงเทพมหานคร": { name_en: "Bangkok", desc_th: "มหานครแห่งวัฒนธรรม ช้อปปิ้ง และวัดวาอารามอันงดงาม", desc_en: "Thailand's vibrant capital, blending ancient temples with modern urban life.", region: "central" },
        "กระบี่": { name_en: "Krabi", desc_th: "อ่าวทะเลสีมรกต หินปูนตระการตา และหาดทรายขาวบริสุทธิ์", desc_en: "Emerald waters, dramatic limestone karsts, and pristine beaches await.", region: "south" },
        "กาญจนบุรี": { name_en: "Kanchanaburi", desc_th: "ดินแดนแห่งประวัติศาสตร์สงคราม น้ำตก และธรรมชาติอันอุดมสมบูรณ์", desc_en: "WWII history meets waterfalls and lush river valleys.", region: "west" },
        "กาฬสินธุ์": { name_en: "Kalasin", desc_th: "เมืองไดโนเสาร์และวัฒนธรรมอีสานที่มีเอกลักษณ์", desc_en: "Famous for dinosaur fossils and rich Isan heritage.", region: "northeast" },
        "กำแพงเพชร": { name_en: "Kamphaeng Phet", desc_th: "นครโบราณสุโขทัย มรดกโลก ขนมหวาน และกล้วยไข่ชื่อดัง", desc_en: "Ancient city ruins, UNESCO heritage, and the famous kluay khai banana.", region: "north" },
        "ขอนแก่น": { name_en: "Khon Kaen", desc_th: "ศูนย์กลางการค้าและวัฒนธรรมอีสาน เมืองสีเขียวแห่งอนาคต", desc_en: "The commercial and cultural hub of northeastern Thailand.", region: "northeast" },
        "จันทบุรี": { name_en: "Chanthaburi", desc_th: "เมืองอัญมณี ผลไม้นานาพันธุ์ และอาหารทะเลสดแสนอร่อย", desc_en: "Gem capital of Thailand, known for tropical fruits and fresh seafood.", region: "east" },
        "ฉะเชิงเทรา": { name_en: "Chachoengsao", desc_th: "เมืองแห่งพระพุทธโสธร ตลาดน้ำ และวิถีชีวิตริมน้ำ", desc_en: "Home to the revered Luang Pho Sothon shrine and floating markets.", region: "central" },
        "ชลบุรี": { name_en: "Chonburi", desc_th: "พัทยา ท่าเรือ สวนสัตว์เปิด และชายหาดที่คึกคัก", desc_en: "Home to Pattaya, Eastern Seaboard, and lively beachfronts.", region: "east" },
        "ชัยนาท": { name_en: "Chai Nat", desc_th: "เมืองนกนางแอ่น เขื่อนเจ้าพระยา และวัฒนธรรมชาวนาไทย", desc_en: "Known for the Chao Phraya Dam and traditional rice-farming culture.", region: "central" },
        "ชัยภูมิ": { name_en: "Chaiyaphum", desc_th: "ดอกกระเจียวบาน ทุ่งดอกไม้ป่า และวิถีชีวิตที่เงียบสงบ", desc_en: "Famous for wild crab-claw ginger blooms and serene countryside.", region: "northeast" },
        "ชุมพร": { name_en: "Chumphon", desc_th: "ประตูสู่ภาคใต้ ดำน้ำหมู่เกาะงาม และทุเรียนชื่อก้อง", desc_en: "Gateway to the south with diving spots and famous durian.", region: "south" },
        "เชียงราย": { name_en: "Chiang Rai", desc_th: "วัดร่องขุ่น วัดพระแก้ว ชาเขา และพรมแดนสามเหลี่ยมทองคำ", desc_en: "White Temple, tea plantations, and the legendary Golden Triangle.", region: "north" },
        "เชียงใหม่": { name_en: "Chiang Mai", desc_th: "เมืองแห่งวัด ดอยสูง ปางช้าง และวัฒนธรรมล้านนา", desc_en: "Northern cultural capital with ancient temples, hill tribes, and elephant sanctuaries.", region: "north" },
        "ตรัง": { name_en: "Trang", desc_th: "เกาะทะเลสวยงาม ถ้ำน้ำ หมูย่าง และชาวเลพื้นเมือง", desc_en: "Beautiful islands, sea caves, and the famous roasted pork.", region: "south" },
        "ตราด": { name_en: "Trat", desc_th: "เกาะช้าง เกาะหมาก ทะเลใส และบรรยากาศแบบ off-the-beaten-path", desc_en: "Ko Chang, Ko Mak, and untouched island escapes near Cambodia.", region: "east" },
        "ตาก": { name_en: "Tak", desc_th: "น้ำตกที่พีสวย ชายแดนแม่สอด ป่าดงดิบ และวัฒนธรรมพม่า", desc_en: "Mae Sot border town, stunning waterfalls, and jungle wilderness.", region: "north" },
        "นครนายก": { name_en: "Nakhon Nayok", desc_th: "น้ำตก แม่น้ำ และสวนผลไม้ใกล้กรุงเทพฯ เพียง 2 ชั่วโมง", desc_en: "Waterfalls, rivers, and orchards just 2 hours from Bangkok.", region: "central" },
        "นครปฐม": { name_en: "Nakhon Pathom", desc_th: "พระปฐมเจดีย์ที่สูงที่สุด ส้มโอหวาน และวิถีไทยโบราณ", desc_en: "Home to the world's tallest stupa and the sweetest pomelos.", region: "central" },
        "นครพนม": { name_en: "Nakhon Phanom", desc_th: "วิวริมโขงที่งดงาม วัดที่ตั้ง ไหว้พระธาตุพนม", desc_en: "Scenic Mekong riverside, Phra That Phanom, and Vietnamese culture.", region: "northeast" },
        "นครราชสีมา": { name_en: "Nakhon Ratchasima", desc_th: "โคราช ประตูอีสาน อุทยานเขาใหญ่ และปราสาทพิมาย", desc_en: "Korat: gateway to Isan, Khao Yai National Park, and Phimai ruins.", region: "northeast" },
        "นครศรีธรรมราช": { name_en: "Nakhon Si Thammarat", desc_th: "เมืองธรรมะ วัดพระมหาธาตุ หนังตะลุง และอาหารใต้แท้", desc_en: "Ancient Buddhist city, shadow puppetry, and authentic Southern Thai cuisine.", region: "south" },
        "นครสวรรค์": { name_en: "Nakhon Sawan", desc_th: "จุดบรรจบแม่น้ำ ตรุษจีนสุดยิ่งใหญ่ และธรรมชาติที่งดงาม", desc_en: "Where the Ping and Nan rivers meet, famous for grand Chinese New Year.", region: "central" },
        "นนทบุรี": { name_en: "Nonthaburi", desc_th: "ทุเรียนนนท์ ตลาดน้ำ และวัดเฉลิมพระเกียรติ", desc_en: "Famous for Nonthaburi durian, floating markets, and royal temples.", region: "central" },
        "นราธิวาส": { name_en: "Narathiwat", desc_th: "ชายหาดสวย วัฒนธรรมมลายู และวิถีชีวิตภาคใต้ชายแดน", desc_en: "Peaceful beaches, Malay culture, and the southernmost Thai border.", region: "south" },
        "น่าน": { name_en: "Nan", desc_th: "เมืองลับแล วัดภูมินทร์ ชาวเขา และธรรมชาติที่บริสุทธิ์", desc_en: "Secluded mountain town, exquisite murals, and pristine nature.", region: "north" },
        "บึงกาฬ": { name_en: "Bueng Kan", desc_th: "ภูทอก หน้าผาสวรรค์ และทัศนียภาพริมแม่น้ำโขง", desc_en: "Phu Thok cliff temple and stunning Mekong River panoramas.", region: "northeast" },
        "บุรีรัมย์": { name_en: "Buriram", desc_th: "ปราสาทหินพนมรุ้ง สนามแข่งรถ และสโมสรฟุตบอลชื่อดัง", desc_en: "Phanom Rung ancient Khmer ruins, motorsport circuit, and football passion.", region: "northeast" },
        "ปทุมธานี": { name_en: "Pathum Thani", desc_th: "เมืองดอกบัว ตลาดน้ำ และชุมชนริมคลองบรรยากาศดี", desc_en: "City of lotus blossoms, canal-side communities, and floating markets.", region: "central" },
        "ประจวบคีรีขันธ์": { name_en: "Prachuap Khiri Khan", desc_th: "หัวหิน ปราณบุรี อาหารทะเลสด และรีสอร์ทชายทะเล", desc_en: "Hua Hin resort town, Pranburi, and the freshest Gulf seafood.", region: "west" },
        "ปราจีนบุรี": { name_en: "Prachinburi", desc_th: "ป่าดงพญาเย็น อุทยานประวัติศาสตร์ และธรรมชาติรกชัฏ", desc_en: "Dong Phayayen forest, historical parks, and serene countryside.", region: "east" },
        "ปัตตานี": { name_en: "Pattani", desc_th: "มัสยิดกรือเซะ วัฒนธรรมมลายู และชายหาดที่เงียบสงบ", desc_en: "Historic Krue Se mosque, Malay heritage, and tranquil fishing villages.", region: "south" },
        "พระนครศรีอยุธยา": { name_en: "Ayutthaya", desc_th: "อดีตราชธานี มรดกโลก ปราสาทโบราณ และตำนานสยาม", desc_en: "Former capital, UNESCO World Heritage temples, and the glory of Siam.", region: "central" },
        "พะเยา": { name_en: "Phayao", desc_th: "กว๊านพะเยา วัดติโลการาม ทะเลสาบน้ำจืดที่สวยงาม", desc_en: "Scenic Kwan Phayao lake, submerged temple, and mountain tranquility.", region: "north" },
        "พังงา": { name_en: "Phang Nga", desc_th: "อ่าวพังงา เกาะตะปู เขาหมาจู และทะเลสีมรกต", desc_en: "Phang Nga Bay, James Bond Island, and spectacular sea caves.", region: "south" },
        "พัทลุง": { name_en: "Phatthalung", desc_th: "ทะเลน้อย นกนานาพันธุ์ หนังตะลุง และวิถีใต้แท้", desc_en: "Thale Noi bird sanctuary, shadow puppetry, and Southern Thai charm.", region: "south" },
        "พิจิตร": { name_en: "Phichit", desc_th: "ชาละวัน จระเข้ยักษ์ แม่น้ำน่าน และตำนานพื้นบ้าน", desc_en: "Legendary giant crocodile, Nan River, and local folklore.", region: "north" },
        "พิษณุโลก": { name_en: "Phitsanulok", desc_th: "วัดพระศรีรัตนมหาธาตุ พระพุทธชินราช และประตูสู่ภาคเหนือ", desc_en: "Home to the revered Phra Phuttha Chinnarat and northern gateway.", region: "north" },
        "เพชรบุรี": { name_en: "Phetchaburi", desc_th: "พระราชวัง ถ้ำ น้ำตาล และขนมหวานชื่อดัง", desc_en: "Royal palaces, limestone caves, and the famous sweet treats.", region: "west" },
        "เพชรบูรณ์": { name_en: "Phetchabun", desc_th: "ภูทับเบิก ทะเลหมอก สตรอเบอร์รี่ และความหนาวเย็น", desc_en: "Phu Thap Boek, misty hilltops, strawberry farms, and cool air.", region: "north" },
        "แพร่": { name_en: "Phrae", desc_th: "บ้านไม้สักโบราณ วัดหลวง และไม้สักงามที่สุดในไทย", desc_en: "Ancient teak mansions, Luang Temple, and teak forest heritage.", region: "north" },
        "ภูเก็ต": { name_en: "Phuket", desc_th: "ไข่มุกอันดามัน หาดทรายขาว ทะเลสวยงาม และชีวิตกลางคืน", desc_en: "Pearl of the Andaman with white sand beaches and vibrant nightlife.", region: "south" },
        "มหาสารคาม": { name_en: "Maha Sarakham", desc_th: "เมืองมหาวิทยาลัย ไหมมัดหมี่ และวัฒนธรรมอีสานดั้งเดิม", desc_en: "University city famous for mudmee silk and Isan academic culture.", region: "northeast" },
        "มุกดาหาร": { name_en: "Mukdahan", desc_th: "ภูผาเทิบ สะพานมิตรภาพ ตลาดอินโดจีน และทิวทัศน์โขง", desc_en: "Phu Pha Thoep, Friendship Bridge, and the Indochina Market.", region: "northeast" },
        "แม่ฮ่องสอน": { name_en: "Mae Hong Son", desc_th: "เมืองสามหมอก ปาย ชาวเขา และธรรมชาติดิบแท้", desc_en: "City of three mists, Pai Valley, hill tribes, and wild nature.", region: "north" },
        "ยโสธร": { name_en: "Yasothon", desc_th: "เทศกาลบั้งไฟ พระธาตุก่องข้าวน้อย และวิถีชาวนา", desc_en: "Rocket Festival, ancient stupa, and authentic rice-farming life.", region: "northeast" },
        "ยะลา": { name_en: "Yala", desc_th: "เมืองชายแดนใต้ สวนสมเด็จ วัฒนธรรมผสมผสาน", desc_en: "Southernmost border city with multicultural heritage and Somdet Park.", region: "south" },
        "ร้อยเอ็ด": { name_en: "Roi Et", desc_th: "ทะเลบัวแดง ศาสนสถานโบราณ และวัฒนธรรมอีสานงดงาม", desc_en: "Red lotus lake, ancient temples, and enchanting Isan folk culture.", region: "northeast" },
        "ระนอง": { name_en: "Ranong", desc_th: "น้ำพุร้อน เกาะพยาม ป่าชายเลน และธรรมชาติบริสุทธิ์", desc_en: "Hot springs, Ko Phayam, mangrove forests, and pristine nature.", region: "south" },
        "ระยอง": { name_en: "Rayong", desc_th: "เกาะเสม็ด ผลไม้ชื่นชอบ อุตสาหกรรม และชายหาดสวยงาม", desc_en: "Ko Samet beaches, tropical fruits, and the Eastern Economic Corridor.", region: "east" },
        "ราชบุรี": { name_en: "Ratchaburi", desc_th: "โอ่งมังกร ถ้ำกระแซ ตลาดน้ำดำเนินสะดวก และแม่น้ำแม่กลอง", desc_en: "Dragon jars, Damnoen Saduak floating market, and river heritage.", region: "west" },
        "ลพบุรี": { name_en: "Lopburi", desc_th: "เมืองลิง ปราสาทขอมโบราณ และเทศกาลลิงชื่อก้อง", desc_en: "City of monkeys, ancient Khmer ruins, and the famous Monkey Festival.", region: "central" },
        "ลำปาง": { name_en: "Lampang", desc_th: "รถม้า เมืองเก่า วัดพระธาตุลำปางหลวง และเซรามิก", desc_en: "Horse-drawn carriages, Lanna temples, and famous ceramic industry.", region: "north" },
        "ลำพูน": { name_en: "Lamphun", desc_th: "เมืองเก่าล้านนา วัดพระธาตุหริภุญชัย และลำไยชื่อดัง", desc_en: "Ancient Lanna town, Hariphunchai temple, and celebrated longan fruit.", region: "north" },
        "เลย": { name_en: "Loei", desc_th: "ภูกระดึง ภูเรือ ทะเลหมอก และอากาศหนาวเย็นสุดในไทย", desc_en: "Phu Kradueng, Phu Ruea, misty peaks, and Thailand's coldest temperatures.", region: "northeast" },
        "ศรีสะเกษ": { name_en: "Si Sa Ket", desc_th: "ปราสาทเขาพระวิหาร ทุ่งกุลาร้องไห้ และผ้าไหมลาวครั่ง", desc_en: "Preah Vihear temple, Thung Kula Ronghai plain, and Lao Krang silk.", region: "northeast" },
        "สกลนคร": { name_en: "Sakon Nakhon", desc_th: "หนองหาน วัดป่าสุทธาวาส และงานบุญออกพรรษา", desc_en: "Nong Han Lake, forest temples, and vibrant Buddhist festivals.", region: "northeast" },
        "สงขลา": { name_en: "Songkhla", desc_th: "หาดสมิหลา นครหาดใหญ่ ทะเลสาบสงขลา และอาหารใต้รสแซ่บ", desc_en: "Samila Beach, Hat Yai city, Songkhla Lake, and fiery Southern cuisine.", region: "south" },
        "สตูล": { name_en: "Satun", desc_th: "อุทยานธรณีโลก เกาะตะรุเตา เกาะหลีเป๊ะ และทะเลใสสวยงาม", desc_en: "UNESCO Geopark, Ko Tarutao, Ko Lipe, and crystal-clear seas.", region: "south" },
        "สมุทรปราการ": { name_en: "Samut Prakan", desc_th: "เมืองปากน้ำ เมืองโบราณ และวิถีชีวิตริมแม่น้ำเจ้าพระยา", desc_en: "Ancient City, Chao Phraya rivermouth, and vibrant port culture.", region: "central" },
        "สมุทรสงคราม": { name_en: "Samut Songkhram", desc_th: "แม่กลอง ตลาดรถไฟ ลิ้นจี่หวาน และวิถีชุมชนริมน้ำ", desc_en: "Maeklong Railway Market, sweet lychees, and tranquil canal life.", region: "central" },
        "สมุทรสาคร": { name_en: "Samut Sakhon", desc_th: "มหาชัย อาหารทะเลสด และท่าเรือประมงที่คึกคัก", desc_en: "Mahachai seafood market, bustling fishing port, and coastal lifestyle.", region: "central" },
        "สระแก้ว": { name_en: "Sa Kaeo", desc_th: "ปราสาทสด๊กก๊อกธม ชายแดนกัมพูชา และธรรมชาติที่สงบ", desc_en: "Sdok Kok Thom ruins, Cambodian border, and peaceful countryside.", region: "east" },
        "สระบุรี": { name_en: "Saraburi", desc_th: "น้ำตกเจ็ดสาวน้อย ทุ่งดอกทานตะวัน วัดพระพุทธฉาย", desc_en: "Saen Sao Noi waterfall, sunflower fields, and hilltop shrines.", region: "central" },
        "สิงห์บุรี": { name_en: "Sing Buri", desc_th: "วีรชนค่ายบางระจัน อนุสาวรีย์ และประวัติศาสตร์กู้ชาติ", desc_en: "Battle of Bang Rachan heroes, patriotic monuments, and quiet countryside.", region: "central" },
        "สุโขทัย": { name_en: "Sukhothai", desc_th: "อุทยานประวัติศาสตร์ต้นกำเนิดอาณาจักรไทย มรดกโลก UNESCO", desc_en: "Birthplace of the Thai kingdom, UNESCO World Heritage historical park.", region: "north" },
        "สุพรรณบุรี": { name_en: "Suphanburi", desc_th: "เมืองสี่พระยา ประวัติศาสตร์กาญจน์ และผ้าลาย", desc_en: "Historical battlefield, Suphan Buri heroes, and cultural heritage.", region: "central" },
        "สุราษฎร์ธานี": { name_en: "Surat Thani", desc_th: "เกาะสมุย เกาะเต่า อ่าวไทย และธุรกิจยางพาราชั้นนำ", desc_en: "Ko Samui, Ko Tao, Gulf of Thailand islands, and rubber industry.", region: "south" },
        "สุรินทร์": { name_en: "Surin", desc_th: "เทศกาลช้าง ผ้าไหม ปราสาทขอม และวัฒนธรรมกวย", desc_en: "Elephant Roundup Festival, Surin silk, and Khmer ruins.", region: "northeast" },
        "หนองคาย": { name_en: "Nong Khai", desc_th: "สะพานมิตรภาพ หินสามวาฬ วัดพระธาตุบังพวน และทิวทัศน์โขง", desc_en: "Thai-Lao Friendship Bridge, Sala Kaeo Ku, and Mekong sunsets.", region: "northeast" },
        "หนองบัวลำภู": { name_en: "Nong Bua Lam Phu", desc_th: "วัดถ้ำกลองเพล ภูพานน้อย และธรรมชาติอีสานที่เงียบสงบ", desc_en: "Tham Klong Phen cave temple, Phu Phan Noi, and quiet Isan landscapes.", region: "northeast" },
        "อ่างทอง": { name_en: "Ang Thong", desc_th: "เมืองเล็กงดงาม วัดไทยดั้งเดิม และหัตถกรรมพื้นบ้าน", desc_en: "Charming small city with classic Thai temples and folk crafts.", region: "central" },
        "อำนาจเจริญ": { name_en: "Amnat Charoen", desc_th: "พระมงคลมิ่งเมือง ป่าดงนาทาม และวิถีชาวอีสาน", desc_en: "Phra Mongkol Ming Mueang, Dong Na Tham forest, and Isan heritage.", region: "northeast" },
        "อุดรธานี": { name_en: "Udon Thani", desc_th: "บึงกาฬน้อย ทะเลบัว บ้านเชียงมรดกโลก และอาหารอีสานรสเข้ม", desc_en: "Ban Chiang UNESCO site, red lotus lake, and bold Isan flavors.", region: "northeast" },
        "อุตรดิตถ์": { name_en: "Uttaradit", desc_th: "ลางสาด ทุเรียนหลง น้ำตก และวิถีชีวิตชาวเหนือ", desc_en: "Langsat fruit, Durian Lungo, waterfalls, and northern Thai culture.", region: "north" },
        "อุทัยธานี": { name_en: "Uthai Thani", desc_th: "ป่าต้นน้ำ เขตรักษาพันธุ์สัตว์ป่า และธรรมชาติที่บริสุทธิ์", desc_en: "Huai Kha Khaeng wildlife sanctuary, pristine forests, and eco-tourism.", region: "central" },
        "อุบลราชธานี": { name_en: "Ubon Ratchathani", desc_th: "แก่งสะพือ ผาแต้ม เทศกาลแห่เทียน และวัฒนธรรมริมโขง", desc_en: "Pha Taem cliff art, Kaeng Saphu rapids, and the Candle Festival.", region: "northeast" },
      };

      const provincesData = provincesList.map((name, index) => {
        const detail = provinceDetails[name] || {
          name_en: name,
          desc_th: `ค้นพบเสน่ห์และสิ่งที่น่าสนใจของ${name}`,
          desc_en: `Discover the unique charm and attractions of ${name}.`,
          region: "central"
        };
        return {
          id: `province-${index + 1}`,
          name: detail.name_en,
          name_th: name,
          description: detail.desc_en,
          description_th: detail.desc_th,
          image: `https://loremflickr.com/800/600/thailand,nature,temple?random=${index + 1}`,
          tourCount: 0,
          region: detail.region,
        };
      });

      // ลบข้อมูลเดิมทิ้งก่อน (ถ้ามี) จะได้ไม่ซ้ำซ้อน
      await this.provinceRepository.query('TRUNCATE TABLE "province" CASCADE');
      // บันทึกข้อมูลใหม่ทั้ง 77 จังหวัดลงฐานข้อมูล
      const data = await this.provinceRepository.save(provincesData);
      console.log('✅ Seeded 77 Provinces into PostgreSQL Database');
      return data;
    }
    return await this.provinceRepository.find();
  }

  private async seedTours(provinces: Province[]) {
    const count = await this.tourRepository.count();

    if (count === 0 && provinces.length > 0) {
      const cm = provinces.find((p) => p.id === 'chiang-mai');
      if (cm) {
        await this.tourRepository.save([
          {
            provinceId: cm.id,
            name: 'Doi Inthanon National Park One Day Tour',
            name_th: 'ทัวร์ดอยอินทนนท์ 1 วัน',
            description: 'Visit the highest peak of Thailand...',
            description_th: 'เยี่ยมชมจุดสูงสุดของประเทศไทย...',
            price: 1500,
            duration: '8 Hours',
            duration_th: '8 ชั่วโมง',
            image: 'https://github.com/psu6810110318/-/blob/main/imagกหดหกหดe.png',
            rating: 4.8,
            reviewCount: 120,
            highlights: ['Visit Pagodas', 'Wachirathan Waterfall', 'Highest Point'],
            highlights_th: ['ชมพระมหาธาตุ', 'น้ำตกวชิรธาร', 'จุดสูงสุดดอยอินทนนท์'],
            itinerary: [
              { time: '08:00', activity: 'Hotel Pickup' },
              { time: '10:30', activity: 'Reach Doi Inthanon' },
            ],
            included: ['Lunch', 'Insurance', 'Entry Fees'],
            notIncluded: ['Tips', 'Personal Expenses'],
          },
        ]);
        console.log('✅ Seeded Mock Tours');
      }
    }
  }

  private async seedUsers() {
    const adminEmail = 'admin@test.com';
    const userEmail = 'user@test.com';
    const password = 'password123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminRole = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });
    const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });

    if (adminRole) {
      const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
      if (existingAdmin) {
        existingAdmin.passwordHash = hashedPassword;
        await this.userRepository.save(existingAdmin);
        console.log('✅ Updated Admin password to hashed version');
      } else {
        await this.userRepository.save({
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: 'Admin Tester',
          role: adminRole,
          provider: 'local',
        });
        console.log('✅ Seeded Admin User');
      }
    }

    if (userRole) {
      const existingUser = await this.userRepository.findOne({ where: { email: userEmail } });
      if (existingUser) {
        existingUser.passwordHash = hashedPassword;
        await this.userRepository.save(existingUser);
        console.log('✅ Updated User password to hashed version');
      } else {
        await this.userRepository.save({
          email: userEmail,
          passwordHash: hashedPassword,
          fullName: 'Normal User',
          role: userRole,
          provider: 'local',
        });
        console.log('✅ Seeded Normal User');
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}