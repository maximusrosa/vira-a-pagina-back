import { PrismaClient } from '@prisma/client';
import { ModeratorRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash as senhas para segurança
  const hashedPassword1 = await bcrypt.hash('password123', 12);
  const hashedPassword2 = await bcrypt.hash('password456', 12);

  console.log('Criando usuários e seus perfis...');
  // Criar um moderador
  const moderator1 = await prisma.moderator.create({
    data: {
      email: 'maria.mod@example.com',
      password: hashedPassword1,
      role: ModeratorRole.MODERATOR
    }
  });

  console.log('Moderador 1 criado:', moderator1);

  // Criar um moderador de usuários
  const userModerator = await prisma.moderator.create({
    data: {
      email: 'carlos.admin@example.com',
      password: hashedPassword2,
      role: ModeratorRole.USER_MODERATOR
    }
  });

  console.log('Moderador de usuários criado:', userModerator);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });