// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
    }
    meals: {
      id: string
      name: string
      description: string
      timestamp: string
      is_in_diet: boolean
      user_id: string
    }
  }
}
