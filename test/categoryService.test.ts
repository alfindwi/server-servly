import { getOrSetCache } from '../src/libs/cache';
import { prisma } from '../src/libs/prisma';
import * as categoryService from '../src/service/categoryService';

// Mock dependencies
jest.mock('../src/libs/cache');
jest.mock('../src/libs/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Type the mocked modules
const mockGetOrSetCache = getOrSetCache as jest.MockedFunction<typeof getOrSetCache>;

// Create properly typed mocks for Prisma
const mockPrismaCategory = {
  findMany: jest.fn() as jest.MockedFunction<any>,
  findUnique: jest.fn() as jest.MockedFunction<any>,
  create: jest.fn() as jest.MockedFunction<any>,
  update: jest.fn() as jest.MockedFunction<any>,
  delete: jest.fn() as jest.MockedFunction<any>,
};

// Mock the prisma import
(prisma as any).category = mockPrismaCategory;

describe('Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCategories', () => {
    const mockCategories = [
      { id: 1, name: 'Technology', description: 'Tech related items' },
      { id: 2, name: 'Sports', description: 'Sports equipment' },
    ];

    it('should return categories from cache', async () => {
      mockGetOrSetCache.mockResolvedValue(mockCategories);

      const result = await categoryService.getCategories();

      expect(mockGetOrSetCache).toHaveBeenCalledWith(
        'categories:all',
        600, // 60 * 10
        expect.any(Function)
      );
      expect(result).toEqual(mockCategories);
    });

    it('should fetch categories from database when cache is empty', async () => {
      mockPrismaCategory.findMany.mockResolvedValue(mockCategories);
      
      // Mock the cache function to call the callback directly
      mockGetOrSetCache.mockImplementation(async (key, ttl, callback) => {
        return await callback();
      });

      const result = await categoryService.getCategories();

      expect(mockPrismaCategory.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockGetOrSetCache.mockImplementation(async (key, ttl, callback) => {
        return await callback();
      });
      mockPrismaCategory.findMany.mockRejectedValue(error);

      await expect(categoryService.getCategories()).rejects.toThrow('Database connection failed');
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('getCategoryById', () => {
    const mockCategory = { id: 1, name: 'Technology', description: 'Tech related items' };

    it('should return category by id', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById(1);

      expect(mockPrismaCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      const result = await categoryService.getCategoryById(999);

      expect(mockPrismaCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaCategory.findUnique.mockRejectedValue(error);

      await expect(categoryService.getCategoryById(1)).rejects.toThrow('Database error');
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('createCategory', () => {
    const mockNewCategory = { id: 1, name: 'Technology', description: 'Tech related items' };

    it('should create a new category', async () => {
      mockPrismaCategory.create.mockResolvedValue(mockNewCategory);

      const result = await categoryService.createCategory('Technology', 'Tech related items');

      expect(mockPrismaCategory.create).toHaveBeenCalledWith({
        data: {
          name: 'Technology',
          description: 'Tech related items',
        },
      });
      expect(result).toEqual(mockNewCategory);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Name is required');
      mockPrismaCategory.create.mockRejectedValue(error);

      await expect(categoryService.createCategory('', 'Description')).rejects.toThrow('Name is required');
      expect(console.log).toHaveBeenCalledWith(error);
    });

    it('should handle duplicate name errors', async () => {
      const error = new Error('Category name already exists');
      mockPrismaCategory.create.mockRejectedValue(error);

      await expect(categoryService.createCategory('Technology', 'Description')).rejects.toThrow('Category name already exists');
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('updateCategory', () => {
    const mockUpdatedCategory = { id: 1, name: 'Updated Technology', description: 'Updated description' };

    it('should update an existing category', async () => {
      mockPrismaCategory.update.mockResolvedValue(mockUpdatedCategory);

      const result = await categoryService.updateCategory(1, 'Updated Technology', 'Updated description');

      expect(mockPrismaCategory.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Technology',
          description: 'Updated description',
        },
      });
      expect(result).toEqual(mockUpdatedCategory);
    });

    it('should handle category not found error', async () => {
      const error = new Error('Category not found');
      mockPrismaCategory.update.mockRejectedValue(error);

      await expect(categoryService.updateCategory(999, 'Name', 'Description')).rejects.toThrow('Category not found');
      expect(console.log).toHaveBeenCalledWith(error);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Name cannot be empty');
      mockPrismaCategory.update.mockRejectedValue(error);

      await expect(categoryService.updateCategory(1, '', 'Description')).rejects.toThrow('Name cannot be empty');
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCategory', () => {
    const mockDeletedCategory = { id: 1, name: 'Technology', description: 'Tech related items' };

    it('should delete a category', async () => {
      mockPrismaCategory.delete.mockResolvedValue(mockDeletedCategory);

      const result = await categoryService.deleteCategory(1);

      expect(mockPrismaCategory.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeletedCategory);
    });

    it('should handle category not found error', async () => {
      const error = new Error('Category not found');
      mockPrismaCategory.delete.mockRejectedValue(error);

      await expect(categoryService.deleteCategory(999)).rejects.toThrow('Category not found');
      expect(console.log).toHaveBeenCalledWith(error);
    });

    it('should handle foreign key constraint errors', async () => {
      const error = new Error('Cannot delete category with existing references');
      mockPrismaCategory.delete.mockRejectedValue(error);

      await expect(categoryService.deleteCategory(1)).rejects.toThrow('Cannot delete category with existing references');
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });
});