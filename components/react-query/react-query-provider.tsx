'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

const queryClient = new QueryClient()

type Props = {
  children: ReactNode
}

export const ReactQueryProvider = ({ children }: Props) => {

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

ReactQueryProvider.displayName = 'ReactQueryProvider'
