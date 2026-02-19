//Category filter controller, ai assisted

const prisma = require('../../prisma/prismaClient.js')

async function listCategories(req, res) {
  try {
    const type = (req.query.type || '').trim();
    const where = type ? { where: { type } } : {};
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, type: true },
      ...where
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch categories' });
  }
}

module.exports = { listCategories };