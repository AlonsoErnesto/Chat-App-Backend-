import { ApolloServer} from 'apollo-server-express';
import express from 'express';

import resolvers from './resolvers.js';
import typeDefs from './typeDef.js';
import jwt from 'jsonwebtoken';

import{WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

const port = process.env.POST || 4000;
const app = express();
const context = ({req}) => {
   const {authorization} = req.headers;
   if(authorization){
      const { userId } = jwt.verify(authorization,process.env.JWT_SECRET);
      return {userId};
   }
}
const schema = makeExecutableSchema({typeDefs,resolvers})
const apolloServer = new ApolloServer({schema,context});

await apolloServer.start();
apolloServer.applyMiddleware({app,path:"/graphql"});

const server = app.listen(port,()=>{
   const wsServer = new WebSocketServer({
      server,
      path:'/graphql',
   });
   useServer({schema},wsServer);
   console.log("APOLLO AND SUBSCRIPTION SERVER IS UP")
})