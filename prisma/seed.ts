import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a demo admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        emailVerified: new Date(),
      },
    })

    // Create a demo course
    const demoCourse = await prisma.course.upsert({
      where: { slug: 'getting-started' },
      update: {},
      create: {
        title: 'Getting Started with NextLMS',
        slug: 'getting-started',
        description: 'Learn how to use NextLMS platform effectively',
        chapters: {
          create: [
            {
              title: 'Introduction',
              index: 1,
              lessons: {
                create: [
                  {
                    title: 'Welcome to NextLMS',
                    index: 1,
                    videoPath: '/courses/getting-started/1-welcome.mp4',
                  },
                ],
              },
            },
          ],
        },
      },
    })

    // Enroll admin in the demo course
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: adminUser.id,
          courseId: demoCourse.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        courseId: demoCourse.id,
      },
    })

    console.log('Database has been seeded. 🌱')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 