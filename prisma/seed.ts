import { ExchangeStatus, PrismaClient } from '@prisma/client';
import { ModeratorRole, BookStatus, BookCondition } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Função para criar um usuário
async function createUser(data: {
  name: string;
  email: string;
  password: string;
  uniCard: string;
  course: string;
  contact: string;
}): Promise<any> {
  return prisma.user.create({
    data: {
      ...data,
      rating: 5.0,
    },
  });
}

// Função para criar um moderador
async function createModerator(data: {
  name: string;
  email: string;
  password: string;
  role: ModeratorRole;
}): Promise<any> {
  return prisma.moderator.create({ data });
}

// Função para criar um livro
async function createBook(data: {
  title: string;
  author: string;
  year: number;
  discipline: string;
  condition: BookCondition;
  ownerId: number;
  status?: string;
  description?: string;
}): Promise<any> {
  return prisma.book.create({
    data: {
      ...data,
      status: BookStatus.WAITING_PUBLICATION_APPROVAL,
    },
  });
}

// Função para criar um exchange
async function createExchange(data: {
  requesterBookId: number;
  providerBookId: number;
  requesterId: number;
  providerId: number;
  status?: string;
  completionDate?: Date;
}): Promise<any> {
  return prisma.exchange.create({
    data: {
      requesterBookId: data.requesterBookId,
      providerBookId: data.providerBookId,
      requesterId: data.requesterId,
      providerId: data.providerId,
      status: ExchangeStatus.REQUESTED,
      completionDate: data.completionDate,
    },
  });
}

// Função para criar uma avaliação
async function createEvaluation(data: {
  raterId: number;
  ratedId: number;
  rating: number;
}): Promise<any> {
  return prisma.evaluation.create({
    data,
  });
}

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Hash das senhas
  const hashedPassword1 = await bcrypt.hash('password123', 12);
  const hashedPassword2 = await bcrypt.hash('password456', 12);
  const hashedPassword3 = await bcrypt.hash('password789', 12);

  // Criar moderadores
  const moderator1 = await createModerator({
    name: 'Maria',
    email: 'maria.mod@example.com',
    password: hashedPassword1,
    role: ModeratorRole.MODERATOR
  });
  console.log('Moderador criado:', moderator1.email);

  const userModerator = await createModerator({
    name: 'Carlos',
    email: 'carlos.admin@example.com',
    password: hashedPassword2,
    role: ModeratorRole.USER_MODERATOR
  });
  console.log('Moderador de usuários criado:', userModerator.email);

  // Criar usuários
  const user1 = await createUser({
    name: 'João Silva',
    email: 'joao@ufrgs.br',
    password: hashedPassword1,
    uniCard: 'UNI001',
    course: 'Engenharia de Software',
    contact: '11999999999'
  });

  const user2 = await createUser({
    name: 'Maria Santos',
    email: 'maria@ufrgs.br',
    password: hashedPassword2,
    uniCard: 'UNI002',
    course: 'Ciência da Computação',
    contact: '11888888888'
  });

  const user3 = await createUser({
    name: 'Pedro Costa',
    email: 'pedro@ufrgs.br',
    password: hashedPassword3,
    uniCard: 'UNI003',
    course: 'Sistemas de Informação',
    contact: '11777777777'
  });

  const user4 = await createUser({
    name: 'Ana Oliveira',
    email: 'ana@ufrgs.br',
    password: hashedPassword1,
    uniCard: 'UNI004',
    course: 'Engenharia de Computação',
    contact: '11666666666'
  });

  // Criar livros
  const book1 = await createBook({
    title: 'Clean Code',
    author: 'Robert Martin',
    year: 2008,
    discipline: 'Programação',
    condition: BookCondition.GOOD,
    ownerId: user1.id,
    description: 'Livro sobre boas práticas de programação'
  });

  const book2 = await createBook({
    title: 'Design Patterns',
    author: 'Gang of Four',
    year: 1994,
    discipline: 'Engenharia de Software',
    condition: BookCondition.LIKE_NEW,
    ownerId: user2.id,
    description: 'Padrões de projeto em orientação a objetos'
  });

  const book3 = await createBook({
    title: 'Algoritmos',
    author: 'Thomas Cormen',
    year: 2009,
    discipline: 'Algoritmos',
    condition: BookCondition.ACCEPTABLE,
    ownerId: user3.id,
    description: 'Introdução aos algoritmos'
  });

  const book4 = await createBook({
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    year: 2008,
    discipline: 'Programação',
    condition: BookCondition.GOOD,
    ownerId: user4.id,
    description: 'As boas práticas do JavaScript'
  });

  console.log('Livros criados:', book1.title, book2.title, book3.title, book4.title);

  // Atualizar status dos livros para AVAILABLE
  await prisma.book.updateMany({
    where: { id: { in: [book1.id, book2.id, book3.id, book4.id] } },
    data: { status: BookStatus.AVAILABLE }
  });

  // Criar mais alguns livros para testes variados
  const book5 = await createBook({
    title: 'Refactoring',
    author: 'Martin Fowler',
    year: 2019,
    discipline: 'Engenharia de Software',
    condition: BookCondition.LIKE_NEW,
    ownerId: user1.id,
    description: 'Melhorando o design do código existente'
  });

  const book6 = await createBook({
    title: 'Database Systems',
    author: 'Ramez Elmasri',
    year: 2015,
    discipline: 'Banco de Dados',
    condition: BookCondition.GOOD,
    ownerId: user2.id,
    description: 'Fundamentos de sistemas de banco de dados'
  });

  console.log('Livros adicionais criados:', book5.title, book6.title);

  // Atualizar status dos novos livros
  await prisma.book.updateMany({
    where: { id: { in: [book5.id, book6.id] } },
    data: { status: BookStatus.AVAILABLE }
  });


  // Criar dados de exemplo para testes no Postman
  console.log('\n=== DADOS PARA TESTES NO POSTMAN ===');
  console.log('Livros disponíveis:');
  console.log(`- Book ID: ${book1.id} - ${book1.title} (Owner: ${user1.id})`);
  console.log(`- Book ID: ${book2.id} - ${book2.title} (Owner: ${user2.id})`);
  console.log(`- Book ID: ${book3.id} - ${book3.title} (Owner: ${user3.id})`);
  console.log(`- Book ID: ${book4.id} - ${book4.title} (Owner: ${user1.id})`);
  console.log(`- Book ID: ${book5.id} - ${book5.title} (Owner: ${user1.id})`);
  console.log(`- Book ID: ${book6.id} - ${book6.title} (Owner: ${user2.id})`);

  // Exemplo de criação de exchanges (novos parâmetros)
  const exchange1 = await createExchange({
    requesterBookId: book1.id,
    providerBookId: book2.id,
    requesterId: user1.id,
    providerId: user2.id
  });

  const exchange2 = await createExchange({
    requesterBookId: book3.id,
    providerBookId: book4.id,
    requesterId: user3.id,
    providerId: user4.id
  });

  console.log('Exchanges criadas:', exchange1.id, exchange2.id);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });