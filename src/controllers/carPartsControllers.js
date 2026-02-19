const carPartModels = require('../models/carPartsModels');
//prisma for the car parts category filter
const prisma = require('../../prisma/prismaClient');

async function getAllCarParts(req, res) {
  const carParts = await carPartModels.getAllCarParts();
  res.json(carParts);
}

async function getCarParts(req, res) {
  const carPart = await carPartModels.getCarPartById(req.params.carPartsid);
  res.json(carPart);
}

//Car parts category filter code

function parseCategoriesRaw(raw) {
  if (!raw) return null;
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

async function searchCarParts(req, res) {
  try {
    const { categories, q, minPrice, maxPrice } = req.query;
    const rawCats = parseCategoriesRaw(categories);

    const where = {};

    if (rawCats && rawCats.length) {
      const numeric = rawCats.every(x => /^\d+$/.test(x));
      if (numeric) {
        const ids = rawCats.map(x => parseInt(x, 10));
        where.categoryId = { in: ids };
      } else {
        // treat as slugs (or mix): fetch matching category ids for given slugs and/or ids
        const slugs = rawCats.filter(x => !/^\d+$/.test(x));
        const idsFromNums = rawCats.filter(x => /^\d+$/.test(x)).map(x => parseInt(x,10));
        if (slugs.length) {
          const found = await prisma.category.findMany({ where: { slug: { in: slugs } }, select: { id: true } });
          const idsFromSlugs = found.map(c => c.id);
          const allIds = idsFromNums.concat(idsFromSlugs);
          if (allIds.length) where.categoryId = { in: allIds };
        } else if (idsFromNums.length) {
          where.categoryId = { in: idsFromNums };
        }
      }
    }

    if (q && q.trim()) {
      const s = q.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      const p = {};
      if (minPrice) p.gte = parseFloat(minPrice);
      if (maxPrice) p.lte = parseFloat(maxPrice);
      where.AND = where.AND || [];
      where.AND.push({ price: p });
    }

    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true, slug: true } } }
      })
    ]);

    res.json({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to search car parts' });
  }
}

module.exports = {
  getAllCarParts,
  getCarParts,
  searchCarParts
};