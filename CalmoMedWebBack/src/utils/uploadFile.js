const path = require('path');
const fs = require('fs');

module.exports = async (file, params = {}) => {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const fileName = Date.now() + '-' + file.name;
  const filePath = path.join(uploadDir, fileName);
  await file.mv(filePath);
  return `/uploads/${fileName}`;
};
