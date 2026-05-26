require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Post = require('./src/models/post.model');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aley-social-media';

const mockUsers = [
  { firstName: 'Minh', lastName: 'Nguyễn', email: 'minh.nguyen@email.com', bio: 'Yêu công nghệ và du lịch', location: 'Hà Nội', avatarShape: 'circle', avatarColor: '#FF6B6B' },
  { firstName: 'Lan', lastName: 'Trần', email: 'lan.tran@email.com', bio: 'Nhiếp ảnh gia | Coffee lover', location: 'TP.HCM', avatarShape: 'square', avatarColor: '#4ECDC4' },
  { firstName: 'Hùng', lastName: 'Lê', email: 'hung.le@email.com', bio: 'Developer | Gamer', location: 'Đà Nẵng', avatarShape: 'triangle', avatarColor: '#45B7D1' },
  { firstName: 'Hoa', lastName: 'Phạm', email: 'hoa.pham@email.com', bio: 'Fashion blogger | Makeup artist', location: 'Hà Nội', avatarShape: 'circle', avatarColor: '#96CEB4' },
  { firstName: 'Nam', lastName: 'Hoàng', email: 'nam.hoang@email.com', bio: 'Fitness trainer | Health coach', location: 'TP.HCM', avatarShape: 'square', avatarColor: '#FFEAA7' },
  { firstName: 'An', lastName: 'Vũ', email: 'an.vu@email.com', bio: 'Music producer | DJ', location: 'Cần Thơ', avatarShape: 'triangle', avatarColor: '#DDA0DD' },
  { firstName: 'Thảo', lastName: 'Đặng', email: 'thao.dang@email.com', bio: 'Foodie | Travel vlogger', location: 'Hải Phòng', avatarShape: 'circle', avatarColor: '#FF8C42' },
  { firstName: 'Khoa', lastName: 'Bùi', email: 'khoa.bui@email.com', bio: 'Architect | Design enthusiast', location: 'Đà Nẵng', avatarShape: 'square', avatarColor: '#6C5CE7' },
  { firstName: 'Mai', lastName: 'Đỗ', email: 'mai.do@email.com', bio: 'Teacher | Bookworm', location: 'Huế', avatarShape: 'triangle', avatarColor: '#00B894' },
  { firstName: 'Dũng', lastName: 'Trịnh', email: 'dung.trinh@email.com', bio: 'Chef | Food critic', location: 'TP.HCM', avatarShape: 'circle', avatarColor: '#E17055' },
  { firstName: 'Linh', lastName: 'Ngô', email: 'linh.ngo@email.com', bio: 'Journalist | News anchor', location: 'Hà Nội', avatarShape: 'square', avatarColor: '#74B9FF' },
  { firstName: 'Quang', lastName: 'Hồ', email: 'quang.ho@email.com', bio: 'Photographer | Cinematographer', location: 'Nha Trang', avatarShape: 'triangle', avatarColor: '#FDCB6E' },
  { firstName: 'Phương', lastName: 'Võ', email: 'phuong.vo@email.com', bio: 'Yoga instructor | Meditation guide', location: 'Vũng Tàu', avatarShape: 'circle', avatarColor: '#A29BFE' },
  { firstName: 'Tuấn', lastName: 'Đinh', email: 'tuan.dinh@email.com', bio: 'Entrepreneur | Startup founder', location: 'Hà Nội', avatarShape: 'square', avatarColor: '#00CEC9' },
  { firstName: 'Hà', lastName: 'Lưu', email: 'ha.luu@email.com', bio: 'Artist | Illustrator', location: 'Hà Nội', avatarShape: 'triangle', avatarColor: '#FD79A8' },
  { firstName: 'Sơn', lastName: 'Tạ', email: 'son.ta@email.com', bio: 'Mountain climber | Adventure seeker', location: 'Lào Cai', avatarShape: 'circle', avatarColor: '#55A3FF' },
  { firstName: 'My', lastName: 'Trịnh', email: 'my.trinh@email.com', bio: 'Fashion designer | Stylist', location: 'TP.HCM', avatarShape: 'square', avatarColor: '#FF7675' },
  { firstName: 'Long', lastName: 'Nguyễn', email: 'long.nguyen@email.com', bio: 'Software engineer | Open source contributor', location: 'Đà Nẵng', avatarShape: 'triangle', avatarColor: '#00B894' },
  { firstName: 'Yến', lastName: 'Phan', email: 'yen.phan@email.com', bio: 'Beauty influencer | Skincare expert', location: 'Biên Hòa', avatarShape: 'circle', avatarColor: '#FDCB6E' },
  { firstName: 'Việt', lastName: 'Hứa', email: 'viet.hua@email.com', bio: 'Motorbike enthusiast | Travel blogger', location: 'Cần Thơ', avatarShape: 'square', avatarColor: '#74B9FF' }
];

// Generate SVG geometric shape avatar
function generateShapeAvatar(shape, color) {
  const svgSize = 400;
  let svgContent = '';

  if (shape === 'circle') {
    svgContent = `<circle cx="200" cy="200" r="190" fill="${color}"/>`;
  } else if (shape === 'square') {
    svgContent = `<rect x="10" y="10" width="380" height="380" rx="30" fill="${color}"/>`;
  } else if (shape === 'triangle') {
    svgContent = `<polygon points="200,15 385,385 15,385" fill="${color}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}">${svgContent}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

const postContents = [
  'Cuối tuần tuyệt vời bên gia đình! 🏠❤️',
  'Cà phê sáng nay thật hoàn hảo ☕️',
  'Làm việc chăm chỉ để đạt được mục tiêu! 💪',
  'Mùa hè này đi đâu nhỉ? 🏖️',
  'Gym time! Không có gì là không thể 💪🔥',
  'Món ăn yêu thích của mình nè 🍜',
  'Ánh hoàng hôn trên biển 🌅',
  'Học hỏi mỗi ngày, tiến bộ mỗi ngày 📚',
  'Gặp gỡ những người bạn tuyệt vời! 👯',
  'Thiên nhiên hùng vĩ 🌄',
  'Nghệ thuật là cách kể chuyện bằng màu sắc 🎨',
  'Chạy bộ mỗi sáng, cuộc sống tươi đẹp hơn 🏃‍♂️',
  'Workshop hôm nay thật bổ ích! 📝',
  'Những khoảnh khắc đáng nhớ 💫',
  'Khám phá ẩm thực địa phương 🍽️',
  'Yoga giúp tâm trí bình yên 🧘‍♀️',
  'Dự án mới đã hoàn thành! 🎉',
  'Mây và núi - Bức tranh thiên nhiên tuyệt đẹp 🏔️',
  'Thời trang là cách thể hiện bản thân 👗',
  'Công nghệ thay đổi cuộc sống 💻'
];

const hashtags = ['#aley', '#socialmedia', '#vietnam', '#lifestyle', '#travel', '#food', '#fitness', '#fashion', '#music', '#art'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️ Cleared existing data');

    const createdUsers = [];
    const password = await bcrypt.hash('password123', 10);

    // Create users
    console.log('\n👥 Creating users...');
    for (const userData of mockUsers) {
      const avatarUrl = generateShapeAvatar(userData.avatarShape, userData.avatarColor);
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: password,
        bio: userData.bio,
        location: userData.location,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        coverImageUrl: `https://picsum.photos/seed/${userData.email}/850/350`,
        avatarUrl: avatarUrl,
        isVerified: true,
        isAdmin: false
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`  ✅ ${userData.firstName} ${userData.lastName} - ${userData.email} - Avatar: ${userData.avatarShape} ${userData.avatarColor}`);
    }

    // Create posts for each user
    console.log('\n📝 Creating posts...');
    for (const user of createdUsers) {
      const numPosts = Math.floor(Math.random() * 5) + 2;
      
      for (let i = 0; i < numPosts; i++) {
        const postHashtags = getRandomElements(hashtags, Math.floor(Math.random() * 4) + 1);
        
        const post = new Post({
          user: user._id,
          content: getRandomElement(postContents) + ' ' + postHashtags.join(' '),
          hashtags: postHashtags.map(h => h.replace('#', '')),
          emotion: getRandomElement(['happy', 'excited', 'loved', 'none']),
          privacy: 'public',
          likes: getRandomElements(createdUsers, Math.floor(Math.random() * 10)).map(u => u._id),
          comments: []
        });

        // Add comments
        const numComments = Math.floor(Math.random() * 5);
        for (let j = 0; j < numComments; j++) {
          const commenter = getRandomElement(createdUsers);
          post.comments.push({
            user: commenter._id,
            text: getRandomElement([
              'Bài viết hay quá! 👍',
              'Đẹp quá! 😍',
              'Mình cũng thích như vậy!',
              'Chia sẻ đi bạn ơi!',
              'Tuyệt vời! 🔥'
            ]),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7))
          });
        }

        await post.save();
      }
      console.log(`  ✅ ${user.firstName}: ${numPosts} posts`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total users created: ${createdUsers.length}`);
    console.log('\n🔐 Login credentials for all users:');
    console.log('   Email: [see list above]');
    console.log('   Password: password123');
    console.log('\n💡 Example: minh.nguyen@email.com / password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
