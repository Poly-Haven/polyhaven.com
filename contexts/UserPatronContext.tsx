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
  earlyAccess: boolean
}

const UserPatronContext = createContext<UserPatronContextType | undefined>(undefined)

export const UserPatronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser()
  const [uuid, setUuid] = useState<string | null>(null)
  const [patron, setPatron] = useState<PatronInfo>({})
  const [earlyAccess, setEarlyAccess] = useState(false)

  useEffect(() => {
    if (uuid) {
      getPatronInfo(uuid).then((resdata) => {
        setPatron(resdata)
        const hasEarlyAccess = resdata && resdata['rewards'] && resdata['rewards'].includes('Early Access')
        if (hasEarlyAccess) {
          localStorage.setItem('ea_validity', Date.now().toString())
          setEarlyAccess(true)
        } else {
          setEarlyAccess(false)
        }
      })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      } else {
        // Check localStorage for persistent early access when no user (valid in last month, but not newer than tomorrow)
        if (typeof window !== 'undefined' && localStorage) {
          const msPerDay = 1000 * 60 * 60 * 24
          const earlyAccessValidity = JSON.parse(localStorage.getItem('ea_validity'))
          const isValid =
            earlyAccessValidity &&
            earlyAccessValidity > Date.now() - msPerDay * 30 &&
            earlyAccessValidity < Date.now() + msPerDay
          setEarlyAccess(isValid)
        }
      }
    }
  }, [user, uuid])

  const value = {
    user,
    isLoading,
    uuid,
    patron,
    earlyAccess,
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
