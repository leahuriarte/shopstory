// Unit tests for Shop Minis transformation utilities
import { describe, it, expect } from 'vitest'
import {
  transformShopMinisProduct,
  transformProductImages,
  transformPrice,
  createProductSetFromShopMinis,
  extractProductMetadata,
  createBehaviorMetadataFromProduct,
  batchTransformShopMinisProducts
} from '../shopMinisTransform'
import type { Product } from '../../types'

describe('shopMinisTransform', () => {
  const mockShopMinisProduct = {
    id: 'gid://shopify/Product/123',
    title: 'Red Cotton T-Shirt',
    description: 'A comfortable red cotton t-shirt',
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        altText: 'Red t-shirt front view',
        width: 800,
        height: 600
      }
    ],
    price: {
      amount: '29.99',
      currencyCode: 'USD'
    },
    vendor: 'TestBrand',
    productType: 'T-Shirts',
    tags: ['red', 'cotton', 'casual', 'summer'],
    variants: [
      {
        id: 'variant-1',
        title: 'Small / Red',
        price: {
          amount: '29.99',
          currencyCode: 'USD'
        },
        availableForSale: true,
        selectedOptions: [
          { name: 'Size', value: 'Small' },
          { name: 'Color', value: 'Red' }
        ]
      }
    ]
  }

  describe('transformShopMinisProduct', () => {
    it('should transform Shop Minis product to internal format', () => {
      const result = transformShopMinisProduct(mockShopMinisProduct)

      expect(result).toMatchObject({
        id: 'gid://shopify/Product/123',
        title: 'Red Cotton T-Shirt',
        description: 'A comfortable red cotton t-shirt',
        vendor: 'TestBrand',
        productType: 'T-Shirts',
        tags: ['red', 'cotton', 'casual', 'summer']
      })

      expect(result.price).toEqual({
        amount: '29.99',
        currencyCode: 'USD'
      })

      expect(result.images).toHaveLength(1)
      expect(result.variants).toHaveLength(1)
    })

    it('should handle missing fields gracefully', () => {
      const minimalProduct = {
        id: 'product-123'
      }

      const result = transformShopMinisProduct(minimalProduct)

      expect(result.id).toBe('product-123')
      expect(result.title).toBe('')
      expect(result.description).toBe('')
      expect(result.images).toEqual([])
      expect(result.price).toEqual({ amount: '0.00', currencyCode: 'USD' })
      expect(result.variants).toEqual([])
    })

    it('should handle alternative field names', () => {
      const alternativeProduct = {
        gid: 'alt-product-123',
        name: 'Alternative Product',
        body: 'Alternative description',
        brand: 'Alternative Brand',
        category: 'Alternative Category'
      }

      const result = transformShopMinisProduct(alternativeProduct)

      expect(result.id).toBe('alt-product-123')
      expect(result.title).toBe('Alternative Product')
      expect(result.description).toBe('Alternative description')
      expect(result.vendor).toBe('Alternative Brand')
      expect(result.productType).toBe('Alternative Category')
    })
  })

  describe('transformProductImages', () => {
    it('should transform image array correctly', () => {
      const images = [
        {
          id: 'img-1',
          url: 'https://example.com/image1.jpg',
          altText: 'Image 1',
          width: 800,
          height: 600
        },
        {
          src: 'https://example.com/image2.jpg',
          alt: 'Image 2'
        }
      ]

      const result = transformProductImages(images)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        altText: 'Image 1',
        width: 800,
        height: 600
      })
      expect(result[1]).toMatchObject({
        id: 'image-1',
        url: 'https://example.com/image2.jpg',
        altText: 'Image 2'
      })
    })

    it('should handle empty image array', () => {
      const result = transformProductImages([])
      expect(result).toEqual([])
    })
  })

  describe('transformPrice', () => {
    it('should handle string price', () => {
      const result = transformPrice('29.99')
      expect(result).toEqual({ amount: '29.99', currencyCode: 'USD' })
    })

    it('should handle price object with amount and currency', () => {
      const priceObj = { amount: 29.99, currencyCode: 'CAD' }
      const result = transformPrice(priceObj)
      expect(result).toEqual({ amount: '29.99', currencyCode: 'CAD' })
    })

    it('should handle minVariantPrice format', () => {
      const priceObj = {
        minVariantPrice: {
          amount: 25.50,
          currencyCode: 'EUR'
        }
      }
      const result = transformPrice(priceObj)
      expect(result).toEqual({ amount: '25.5', currencyCode: 'EUR' })
    })

    it('should handle numeric price', () => {
      const result = transformPrice(19.99)
      expect(result).toEqual({ amount: '19.99', currencyCode: 'USD' })
    })

    it('should handle null/undefined price', () => {
      expect(transformPrice(null)).toEqual({ amount: '0.00', currencyCode: 'USD' })
      expect(transformPrice(undefined)).toEqual({ amount: '0.00', currencyCode: 'USD' })
    })
  })

  describe('createProductSetFromShopMinis', () => {
    it('should create a product set from Shop Minis products', () => {
      const products = [mockShopMinisProduct]
      const insight = 'Top color preference: Red'
      const setName = 'Red Collection'

      const result = createProductSetFromShopMinis(products, insight, setName, 'high')

      expect(result.name).toBe('Red Collection')
      expect(result.insight).toBe('Top color preference: Red')
      expect(result.products).toHaveLength(1)
      expect(result.urgencyLevel).toBe('high')
      expect(result.originalPrice).toBe(29.99)
      expect(result.bundlePrice).toBeLessThan(result.originalPrice)
      expect(result.savings).toBeGreaterThan(0)
      expect(result.expiresAt).toBeInstanceOf(Date)
    })

    it('should calculate bundle pricing based on urgency level', () => {
      const products = [mockShopMinisProduct]
      
      const lowUrgency = createProductSetFromShopMinis(products, 'test', 'test', 'low')
      const mediumUrgency = createProductSetFromShopMinis(products, 'test', 'test', 'medium')
      const highUrgency = createProductSetFromShopMinis(products, 'test', 'test', 'high')

      expect(highUrgency.bundlePrice).toBeLessThan(mediumUrgency.bundlePrice!)
      expect(mediumUrgency.bundlePrice).toBeLessThan(lowUrgency.bundlePrice!)
    })
  })

  describe('extractProductMetadata', () => {
    let transformedProduct: Product

    beforeEach(() => {
      transformedProduct = transformShopMinisProduct(mockShopMinisProduct)
    })

    it('should extract metadata from product', () => {
      const metadata = extractProductMetadata(transformedProduct)

      expect(metadata).toHaveProperty('colors')
      expect(metadata).toHaveProperty('categories')
      expect(metadata).toHaveProperty('brand')
      expect(metadata).toHaveProperty('priceRange')
      expect(metadata).toHaveProperty('tags')
      expect(metadata).toHaveProperty('availability')

      expect(metadata.brand).toBe('TestBrand')
      expect(metadata.categories).toContain('T-Shirts')
      expect(metadata.tags).toContain('red')
      expect(metadata.availability).toBe(true)
    })

    it('should extract colors from various sources', () => {
      const metadata = extractProductMetadata(transformedProduct)
      expect(metadata.colors).toContain('red')
    })

    it('should determine correct price range', () => {
      const metadata = extractProductMetadata(transformedProduct)
      expect(metadata.priceRange).toBe('mid-range') // 29.99 falls in mid-range
    })
  })

  describe('createBehaviorMetadataFromProduct', () => {
    let transformedProduct: Product

    beforeEach(() => {
      transformedProduct = transformShopMinisProduct(mockShopMinisProduct)
    })

    it('should create behavior metadata from product', () => {
      const metadata = createBehaviorMetadataFromProduct(transformedProduct, 'view', 'story')

      expect(metadata.source).toBe('story')
      expect(metadata.priceAtTime).toBe(29.99)
      expect(metadata.context).toMatchObject({
        productId: transformedProduct.id,
        category: 'T-Shirts',
        brand: 'TestBrand',
        currency: 'USD'
      })
    })

    it('should handle different interaction types', () => {
      const viewMetadata = createBehaviorMetadataFromProduct(transformedProduct, 'view')
      const purchaseMetadata = createBehaviorMetadataFromProduct(transformedProduct, 'purchase')

      expect(viewMetadata.context.productId).toBe(transformedProduct.id)
      expect(purchaseMetadata.context.productId).toBe(transformedProduct.id)
    })
  })

  describe('batchTransformShopMinisProducts', () => {
    it('should transform multiple products', () => {
      const products = [
        mockShopMinisProduct,
        { ...mockShopMinisProduct, id: 'product-2', title: 'Blue Shirt' }
      ]

      const result = batchTransformShopMinisProducts(products)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Red Cotton T-Shirt')
      expect(result[1].title).toBe('Blue Shirt')
    })

    it('should filter out invalid products', () => {
      const products = [
        mockShopMinisProduct,
        null,
        undefined,
        {},
        { id: 'valid-product', title: 'Valid Product' }
      ]

      const result = batchTransformShopMinisProducts(products)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Red Cotton T-Shirt')
      expect(result[1].title).toBe('Valid Product')
    })

    it('should handle empty array', () => {
      const result = batchTransformShopMinisProducts([])
      expect(result).toEqual([])
    })
  })
})