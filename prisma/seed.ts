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

// Função para criar um match
async function createMatch(data: {
  user1Id: number;
  user2Id: number;
  booksUser1Ids: number[];
  booksUser2Ids: number[];
}): Promise<any> {
  return prisma.match.create({
    data: {
      user1: { connect: { id: data.user1Id } },
      user2: { connect: { id: data.user2Id } },
      booksUser1: { connect: data.booksUser1Ids.map(id => ({ id })) },
      booksUser2: { connect: data.booksUser2Ids.map(id => ({ id })) },
    },
  });
}

// Função para criar um exchange
async function createExchange(data: {
  matchId: number;
  requesterBooksIds: number[];
  providerBooksIds: number[];
  status?: string;
  completionDate?: Date;
}): Promise<any> {
  return prisma.exchange.create({
    data: {
      match: { connect: { id: data.matchId } },
      requesterBooks: { connect: data.requesterBooksIds.map(id => ({ id })) },
      providerBooks: { connect: data.providerBooksIds.map(id => ({ id })) },
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
    email: 'maria.mod@example.com',
    password: hashedPassword1,
    role: ModeratorRole.MODERATOR
  });
  console.log('Moderador criado:', moderator1.email);

  const userModerator = await createModerator({
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

  console.log('Usuários criados:', user1.name, user2.name, user3.name);

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
    ownerId: user1.id,
    description: 'As boas práticas do JavaScript'
  });

  console.log('Livros criados:', book1.title, book2.title, book3.title, book4.title);

  // Atualizar status dos livros para AVAILABLE
  await prisma.book.updateMany({
    where: { id: { in: [book1.id, book2.id, book3.id, book4.id] } },
    data: { status: BookStatus.AVAILABLE }
  });

  // Criar matches
  const match1 = await createMatch({
    user1Id: user1.id,
    user2Id: user2.id,
    booksUser1Ids: [book1.id], // João oferece Clean Code
    booksUser2Ids: [book2.id]  // Maria oferece Design Patterns
  });

  const match2 = await createMatch({
    user1Id: user2.id,
    user2Id: user3.id,
    booksUser1Ids: [book2.id], // Maria oferece Design Patterns
    booksUser2Ids: [book3.id]  // Pedro oferece Algoritmos
  });

  console.log('Matches criados:', match1.id, match2.id);

  // Criar exchanges
  const exchange1 = await createExchange({
    matchId: match1.id,
    requesterBooksIds: [book1.id],
    providerBooksIds: [book2.id]
  });

  const exchange2 = await createExchange({
    matchId: match2.id,
    requesterBooksIds: [book2.id],
    providerBooksIds: [book3.id]
  });

  console.log('Exchanges criados:', exchange1.id, exchange2.id);

  // Criar avaliações
  const evaluation1 = await createEvaluation({
    raterId: user1.id,
    ratedId: user2.id,
    rating: 4.5
  });

  const evaluation2 = await createEvaluation({
    raterId: user2.id,
    ratedId: user3.id,
    rating: 5.0
  });

  console.log('Avaliações criadas:', evaluation1.id, evaluation2.id);

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