import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {Box, ChakraProvider, Flex} from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <ChakraProvider>
          <Flex justifyContent={"center"}>
              <Box width={"700px"}>
            <App />
              </Box>
          </Flex>
      </ChakraProvider>
  </React.StrictMode>,
)
