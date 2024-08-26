import prisma from '../lib/db';
import bcrypt from 'bcryptjs';

export async function createUser(email, password, name) {
  if (!email || !password || !name) {
    throw new Error('All fields are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  return { id: newUser.id, email: newUser.email, name: newUser.name };
}