import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { getPatronInfo } from 'utils/patronInfo'

interface PatronInfo {
  error?: string
  status?: string
  display_name?: string
  name?: string
  yearly_pledge?: boolean
  cents?: number
  rewards?: string[]
  [key: string]: any
}

interface UserPatronContextType {
  user: any
  isLoading: boolean
  uuid: string | null
  patron: PatronInfo
}

const UserPatronContext = createContext<UserPatronContextType | undefined>(undefined)

export const UserPatronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser()
  const [uuid, setUuid] = useState<string | null>(null)
  const [patron, setPatron] = useState<PatronInfo>({})

  useEffect(() => {
    if (uuid) {
      getPatronInfo(uuid).then((resdata) => {
        setPatron(resdata)
        if (resdata && resdata['rewards'] && resdata['rewards'].includes('Early Access')) {
          localStorage.setItem('ea_validity', Date.now().toString())
        }
      })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      }
    }
  }, [user, uuid])

  const value = {
    user,
    isLoading,
    uuid,
    patron,
  }

  return <UserPatronContext.Provider value={value}>{children}</UserPatronContext.Provider>
}

export const useUserPatron = () => {
  const context = useContext(UserPatronContext)
  if (context === undefined) {
    throw new Error('useUserPatron must be used within a UserPatronProvider')
  }
  return context
}
