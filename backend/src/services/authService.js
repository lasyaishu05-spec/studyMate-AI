const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function signup({ name, email, password }) {
 const existing = await prisma.user.findUnique({ where: { email } });
 if (existing) throw { status: 409, message: 'Email already registered' };

 const passwordHash = await bcrypt.hash(password, 10);
 const user = await prisma.user.create({
   data: { name, email, passwordHash },
 });
 return signToken(user);
}

async function login({ email, password }) {
 const user = await prisma.user.findUnique({ where: { email } });
 if (!user) throw { status: 401, message: 'Invalid credentials' };

 const valid = await bcrypt.compare(password, user.passwordHash);
 if (!valid) throw { status: 401, message: 'Invalid credentials' };

 return signToken(user);
}

function signToken(user) {
 const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
 return { token, user: { id: user.id, name: user.name, email: user.email } };
}

module.exports = { signup, login };