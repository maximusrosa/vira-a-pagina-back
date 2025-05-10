// filepath: prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criação de usuários
  await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedpassword1',
        role: 'STUDENT',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'hashedpassword2', 
        role: 'USER_MODERATOR',
      },
    ],
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });