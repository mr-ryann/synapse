import { Client, Account, Databases, Functions } from 'appwrite'

const client = new Client()

client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68d158780003f084d817')

export const account = new Account(client)
export const databases = new Databases(client)
export const functions = new Functions(client)

export default client
