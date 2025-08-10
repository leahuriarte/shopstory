---
title: useSavedProducts
description: The `useSavedProducts` hook fetches the current user's saved products.
source_url:
  html: http://shopify.dev/docs/api/shop-minis/hooks/user/usesavedproducts
  md: http://shopify.dev/docs/api/shop-minis/hooks/user/usesavedproducts.txt
---

# use​Saved​Productshook

The `useSavedProducts` hook fetches the current user's saved products.

## use​Saved​Products([params](#-propertydetail-params)​)

### Parameters

* params

Options for the hook.

### Returns

### UseSavedProductsReturns

* error

  Error | null

* fetchMore

  () => Promise\<void>

* hasNextPage

  boolean

* loading

  boolean

* products

  \[] | null

* refetch

  () => Promise\<void>

## Example code

```tsx
import {useEffect} from 'react'


import {useSavedProducts, Button} from '@shopify/shop-minis-react'


export default function MyComponent() {
  const {products, fetchMore} = useSavedProducts({first: 10})


  useEffect(() => {
    console.log(products)
  }, [products])


  return <Button onClick={fetchMore}>Fetch more</Button>
}
```