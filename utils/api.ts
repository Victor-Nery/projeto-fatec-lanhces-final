import axios from 'axios';

const api = axios.create({
  // Descomente APENAS A LINHA do link que você quer usar no momento:
  
  // Opção A: Nova API do Render (Provavelmente a com a Coca-Cola de sexta-feira)
  //baseURL: 'https://fateclanchesback-0erx.onrender.com', 

  // Opção B: API de atualização de perfil do Render
   baseURL: 'https://fateclanchesback-attperfil.onrender.com', 

  // Opção C: API antiga do Render
  // baseURL: 'https://fateclanchesback.onrender.com',

  // Opção D: Se você quiser rodar a API local no seu PC (Lembre de usar o SEU IP)
  // baseURL: 'http://192.168.0.21:3000', 

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;