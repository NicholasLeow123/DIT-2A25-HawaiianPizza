// code to test the filter model functions, assisted by AI

const { PrismaClient } = require('@prisma/client');
const express = require('express');
const request = require('supertest');
const categoryRoutes = require('../src/routers/categories.js');
const carRoutes = require('../src/routers/carsRoutes.js');
const carPartsRoutes = require('../src/routers/carPartsRoutes.js');

const prisma = new PrismaClient();

// Setup minimal Express app for testing both routes separately
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cars', carRoutes);
  app.use('/api/car-parts', carPartsRoutes);
  return app;
}

// Seed sample data for tests
async function seedData() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Categories for cars
  await prisma.category.createMany({
    data: [
      { id: 1, name: 'JDM', slug: 'jdm', type: 'car' },
      { id: 2, name: 'Euro', slug: 'euro', type: 'car' },
      { id: 3, name: 'Muscle', slug: 'muscle', type: 'car' },
      { id: 4, name: 'AWD', slug: 'awd', type: 'car' }
    ]
  });

  // Categories for car parts
  await prisma.category.createMany({
    data: [
      { id: 5, name: 'Engine', slug: 'engine', type: 'carPart' },
      { id: 6, name: 'Suspension', slug: 'suspension', type: 'carPart' }
    ]
  });

  // Products of type car
  await prisma.product.createMany({
    data: [
      { title: 'Honda Civic', description: 'JDM car', price: 10000, categoryId: 1 },
      { title: 'BMW M3', description: 'Euro car', price: 25000, categoryId: 2 },
      { title: 'Ford Mustang', description: 'Muscle car', price: 30000, categoryId: 3 },
      { title: 'Subaru WRX', description: 'AWD JDM car', price: 22000, categoryId: 4 }
    ]
  });

  // Products of type car parts
  await prisma.product.createMany({
    data: [
      { title: 'Turbocharger', description: 'Engine part', price: 1200, categoryId: 5 },
      { title: 'Coilover Kit', description: 'Suspension part', price: 1500, categoryId: 6 }
    ]
  });
}

describe('Category Filter API with separate car and car part routes', () => {
  let app;

  beforeAll(async () => {
    app = createApp();
    await seedData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Categories tests for cars
  test('GET /api/categories returns car categories when type=car', async () => {
    const res = await request(app).get('/api/categories?type=car');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
    expect(res.body.some(c => c.name === 'JDM')).toBe(true);
  });

  // Categories tests for car parts
  test('GET /api/categories returns car part categories when type=carPart', async () => {
    const res = await request(app).get('/api/categories?type=carPart');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.some(c => c.name === 'Engine')).toBe(true);
  });

  // Car products no filter
  test('GET /api/cars/search returns all car products', async () => {
    const res = await request(app).get('/api/cars/search');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(4);
  });

  // Car parts no filter
  test('GET /api/car-parts/search returns all car part products', async () => {
    const res = await request(app).get('/api/car-parts/search');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  // Filter cars by category id
  test('GET /api/cars/search filters cars by category id', async () => {
    const res = await request(app).get('/api/cars/search').query({ categories: '1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Honda Civic');
  });

  // Filter car parts by category id
  test('GET /api/car-parts/search filters car parts by category id', async () => {
    const res = await request(app).get('/api/car-parts/search').query({ categories: '5' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Turbocharger');
  });

  // Filter cars by multiple categories
  test('GET /api/cars/search filters cars by multiple category ids', async () => {
    const res = await request(app).get('/api/cars/search').query({ categories: '1,2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    const titles = res.body.data.map(p => p.title);
    expect(titles).toEqual(expect.arrayContaining(['Honda Civic', 'BMW M3']));
  });

  // Filter car parts by text search
  test('GET /api/car-parts/search filters by text search', async () => {
    const res = await request(app).get('/api/car-parts/search').query({ q: 'turbo' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Turbocharger');
  });

  // Filter cars by price range
  test('GET /api/cars/search filters cars by price range', async () => {
    const res = await request(app).get('/api/cars/search').query({ minPrice: '20000', maxPrice: '30000' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
    const titles = res.body.data.map(p => p.title);
    expect(titles).toEqual(expect.arrayContaining(['BMW M3', 'Ford Mustang', 'Subaru WRX']));
  });

  // Combined filter on cars
  test('GET /api/cars/search combined filters', async () => {
    const res = await request(app).get('/api/cars/search').query({ categories: '4', q: 'JDM', minPrice: '20000' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Subaru WRX');
  });
});