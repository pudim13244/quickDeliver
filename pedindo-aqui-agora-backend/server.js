console.log('Iniciando server.js - Versão 2.0.0');
// Importar módulos
console.log('Importando express...');
const express = require('express');
console.log('Express importado com sucesso.');

console.log('Criando instância do express...');
const app = express();
console.log('Instância do express criada com sucesso.');

// Carrega as configurações
console.log('Carregando configurações...');
const config = require('./config');
console.log('Configurações carregadas com sucesso.');

// Configura as variáveis de ambiente
process.env.DB_HOST = config.DB_HOST;
process.env.DB_USER = config.DB_USER;
process.env.DB_PASSWORD = config.DB_PASSWORD;
process.env.DB_NAME = config.DB_NAME;
process.env.JWT_SECRET = config.JWT_SECRET;
process.env.PORT = config.PORT;

console.log('Server.js starting...');

console.log('Importando mysql2...');
const mysql = require('mysql2/promise'); // Usando a versão com Promises
console.log('mysql2 importado com sucesso.');

console.log('Importando cors...');
const cors = require('cors');
console.log('cors importado com sucesso.');

console.log('Importando bcrypt...');
const bcrypt = require('bcrypt');
console.log('bcrypt importado com sucesso.');

console.log('Importando jsonwebtoken...');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken
console.log('jsonwebtoken importado com sucesso.');

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Chave secreta para JWT (MUDAR EM PRODUÇÃO!)

// Middleware para analisar o corpo das requisições como JSON
console.log('Configurando middleware express.json()...');
app.use(express.json());
console.log('Express JSON middleware configured.');

// Configuração do CORS
console.log('Configurando CORS...');
app.use(cors({
  origin: [
    'http://vmagenciadigital.com',
    'https://vmagenciadigital.com',
    'https://quickdeliver1.vmagenciadigital.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080'  // Adicionando a porta 8080
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache das opções de preflight por 24 horas
}));
console.log('CORS configured.');

// Configuração do pool de conexão com o banco de dados
console.log('Criando pool de conexão com o banco de dados...');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 segundos
  port: 3306, // Porta padrão do MySQL
  ssl: false // Desabilita SSL para conexão direta
});
console.log('Database pool created.');

// Testar a conexão com o banco de dados
console.log('Testando conexão com o banco de dados...');
const util = require('util');
pool.getConnection()
  .then(connection => {
    console.log('Conectado ao banco de dados MySQL!');
    connection.release(); // Libera a conexão
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
    try {
      console.error('Erro detalhado (JSON):', JSON.stringify(err, null, 2));
    } catch (jsonErr) {
      console.error('Não foi possível converter o erro para JSON:', jsonErr);
    }
    if (err && typeof err === 'object') {
      console.error('Propriedades do erro:');
      for (const key in err) {
        if (Object.prototype.hasOwnProperty.call(err, key)) {
          console.error(`${key}:`, err[key]);
        }
      }
    }
    // Log extra usando util.inspect
    try {
      console.error('Erro detalhado (util.inspect):', util.inspect(err, { showHidden: false, depth: null }));
    } catch (inspectErr) {
      console.error('Não foi possível usar util.inspect:', inspectErr);
    }
  });

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Rota para buscar todas as categorias
app.get('/api/categories', async (req, res) => {
  try {
    // Buscar tipos de culinária distintos dos estabelecimentos
    const [rows] = await pool.query(`SELECT DISTINCT cuisine_type AS name FROM establishment_profile WHERE cuisine_type IS NOT NULL AND cuisine_type != ''`);
    
    // Mapear os resultados para o formato da interface Category (id e name)
    const categories = rows.map((row) => ({
      id: row.name.toLowerCase(), // Usar o nome como ID
      name: row.name
    }));

    res.json(categories);
  } catch (err) {
    console.error('Erro ao buscar categorias de estabelecimento:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar todos os estabelecimentos (restaurantes)
app.get('/api/establishments', async (req, res) => {
  try {
    // Junta users com establishment_profile para obter dados completos do restaurante
    const [rows] = await pool.query(`
      SELECT
        u.id,
        ep.restaurant_name AS name,
        ep.cuisine_type AS category,
        ep.description,
        CAST(ep.delivery_fee AS DECIMAL(10,2)) AS delivery_fee,
        ep.business_hours,
        ep.delivery_radius,
        ep.minimum_order,
        ep.logo_url AS image_url,
        ep.banner_url,
        ep.instagram,
        ep.whatsapp,
        CAST(0 AS DECIMAL(2,1)) AS rating -- Temporariamente define rating como 0 e garante que é numérico
      FROM users u
      JOIN establishment_profile ep ON u.id = ep.user_id
      WHERE u.role = 'ESTABLISHMENT'
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar estabelecimentos:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar detalhes de um estabelecimento específico
app.get('/api/establishments/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        ep.restaurant_name AS name,
        ep.cuisine_type AS category,
        ep.description,
        CAST(ep.delivery_fee AS DECIMAL(10,2)) AS delivery_fee,
        ep.business_hours,
        ep.delivery_radius,
        ep.minimum_order,
        ep.logo_url AS image_url,
        ep.banner_url,
        ep.instagram,
        ep.whatsapp,
        CAST(0 AS DECIMAL(2,1)) AS rating -- Temporariamente define rating como 0 e garante que é numérico
      FROM users u
      JOIN establishment_profile ep ON u.id = ep.user_id
      WHERE u.role = 'ESTABLISHMENT' AND u.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar detalhes do estabelecimento:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar produtos de um estabelecimento específico
app.get('/api/establishments/:id/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        CAST(p.price AS DECIMAL(10,2)) as price,
        p.image_url,
        p.establishment_id,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.establishment_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos do estabelecimento:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar grupos de opções de um produto específico
app.get('/api/products/:id/option-groups', async (req, res) => {
  try {
    const productId = req.params.id;
    const [rows] = await pool.query(`
      SELECT 
        og.id AS group_id,
        og.name AS group_name,
        og.description AS group_description,
        og.is_required,
        og.min_selections,
        og.max_selections,
        og.product_type,
        o.id AS option_id,
        o.name AS option_name,
        o.description AS option_description,
        CAST(o.additional_price AS DECIMAL(10,2)) AS additional_price,
        o.is_available
      FROM option_groups og
      JOIN product_option_groups pog ON og.id = pog.group_id
      LEFT JOIN options o ON og.id = o.group_id
      WHERE pog.product_id = ?
      ORDER BY og.id, o.id
    `, [productId]);

    const optionGroupsMap = new Map();

    rows.forEach(row => {
      if (!optionGroupsMap.has(row.group_id)) {
        optionGroupsMap.set(row.group_id, {
          id: row.group_id,
          name: row.group_name,
          description: row.group_description,
          is_required: row.is_required,
          min_selections: row.min_selections,
          max_selections: row.max_selections,
          product_type: row.product_type,
          options: []
        });
      }
      if (row.option_id) {
        optionGroupsMap.get(row.group_id).options.push({
          id: row.option_id,
          group_id: row.group_id,
          name: row.option_name,
          description: row.option_description,
          additional_price: row.additional_price,
          is_available: row.is_available
        });
      }
    });

    res.json(Array.from(optionGroupsMap.values()));

  } catch (err) {
    console.error('Erro ao buscar grupos de opções do produto:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para registro de novos usuários
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios: nome, email, senha, e função (role).' });
  }

  try {
    // Verificar se o email já existe
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    // Gerar o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o custo do salt

    // Inserir o novo usuário na tabela users
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone || null, address || null]
    );

    const userId = userResult.insertId;

    // Se for um estabelecimento, criar um perfil de estabelecimento
    if (role === 'ESTABLISHMENT') {
      // Valores padrão para o perfil do estabelecimento
      const defaultRestaurantName = name; // Usar o nome do usuário como nome inicial do restaurante
      const defaultBusinessHours = 'Seg-Sex: 9h-18h';
      const defaultDeliveryRadius = 5;
      const defaultPixKey = '';
      const defaultDescription = '';
      const defaultCuisineType = 'Diversos';
      const defaultMinimumOrder = 20.00;
      const defaultDeliveryFee = 5.00;

      await pool.query(
        `INSERT INTO establishment_profile (
          user_id, restaurant_name, business_hours, delivery_radius,
          pix_key, description, cuisine_type, minimum_order, delivery_fee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, defaultRestaurantName, defaultBusinessHours, defaultDeliveryRadius,
          defaultPixKey, defaultDescription, defaultCuisineType, defaultMinimumOrder, defaultDeliveryFee
        ]
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: userId, email: email, role: role },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expira em 24 horas
    );

    // Retornar token e dados do usuário
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso!', 
      token: token,
      user: {
        id: userId,
        name: name,
        email: email,
        role: role,
        phone: phone,
        address: address
      }
    });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de login de usuário
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    // Buscar usuário pelo email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const user = users[0];

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar token e dados do usuário
    res.json({
      message: 'Login realizado com sucesso!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    console.error('Erro ao fazer login:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware de autenticação para proteger rotas
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Cabeçalho de Autorização recebido:', authHeader); // Adicionado para depuração
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extraído:', token); // Adicionado para depuração

  if (token == null) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Erro de verificação do token:', err);
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user; // Adiciona as informações do usuário (id, email, role) à requisição
    next();
  });
};

// Rota para buscar endereços do usuário logado
app.get('/api/addresses', authenticateToken, async (req, res) => {
  try {
    // O `userId` é acessado através de `req.user` definido no middleware `authenticateToken`
    const userId = req.user.userId;

    // Assume-se que o endereço está na tabela `users` por enquanto
    // Em um cenário real, você teria uma tabela `addresses` separada e relacionada a `users`
    const [rows] = await pool.query(
      'SELECT id, address, phone FROM users WHERE id = ?', // Busca o address e phone do user
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Endereços não encontrados para este usuário.' });
    }

    // Retorna o endereço do usuário. Se houver mais endereços no futuro, adapte a lógica.
    res.json(rows.map(row => ({ 
      id: row.id, 
      label: "Endereço Principal", // Label mockado, em um sistema real viria do DB
      street: row.address ? row.address.split(', ')[0] : '', // Extrai rua
      number: row.address ? row.address.split(', ')[1] : '', // Extrai número
      complement: "", // Complemento vazio por padrão
      neighborhood: row.address ? row.address.split(', ')[2] : '', // Extrai bairro
      city: "", // Cidade vazia por padrão
      state: "", // Estado vazio por padrão
      zipCode: "", // CEP vazio por padrão
      isDefault: true // Marcado como padrão por enquanto
    })));

  } catch (err) {
    console.error('Erro ao buscar endereços:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Nova rota para buscar métodos de pagamento
app.get('/api/payment-methods', authenticateToken, (req, res) => {
    const paymentMethods = [
        { id: 'CASH', name: 'Dinheiro', description: 'Pagamento em dinheiro na entrega' },
        { id: 'CREDIT', name: 'Cartão de Crédito', description: 'Pagar com cartão de crédito na entrega ou online' },
        { id: 'DEBIT', name: 'Cartão de Débito', description: 'Pagar com cartão de débito na entrega' },
        { id: 'PIX', name: 'PIX', description: 'Pagar via PIX' },
    ];
    res.json(paymentMethods);
});

// Rota para criar um novo pedido
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total, deliveryAddress, paymentMethod, paymentDetails } = req.body;
  const customerId = req.user.userId; // ID do cliente do token JWT

  if (!items || items.length === 0 || !total || !deliveryAddress || !paymentMethod) {
    return res.status(400).json({ message: 'Dados do pedido incompletos.' });
  }

  // Obter o establishment_id do primeiro item (assumindo que todos os itens são do mesmo estabelecimento)
  const establishmentId = items[0]?.restaurantId;

  if (!establishmentId) {
    return res.status(400).json({ message: 'ID do estabelecimento não fornecido nos itens do pedido.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Inserir o pedido na tabela orders
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, establishment_id, status, total_amount, delivery_fee, payment_method, order_type, amount_paid, change_amount, payment_status, delivery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        customerId,
        establishmentId,
        'PENDING', // Status inicial do pedido
        total,
        4.99, // Taxa de entrega fixa por enquanto (pode vir dinamicamente)
        paymentMethod,
        'DELIVERY', // Tipo de pedido fixo por enquanto
        paymentDetails.changeFor || null, // Valor pago para troco (se for dinheiro)
        paymentDetails.changeFor && paymentMethod === 'CASH' ? paymentDetails.changeFor - total : null, // Troco calculado
        'PENDING', // Status do pagamento
        null // Delivery ID, pode ser atribuído depois
      ]
    );

    const orderId = orderResult.insertId;

    // Inserir os itens do pedido na tabela order_items
    for (const item of items) {
      // Calcular o preço total do item (base + customizações)
      const itemPriceWithCustomizations = item.price + (item.customizations ? item.customizations.reduce((sum, opt) => sum + (opt.additional_price || 0), 0) : 0);
      const itemTotal = itemPriceWithCustomizations * item.quantity;

      const [orderItemResult] = await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, obs) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.quantity, itemPriceWithCustomizations, item.observations || null]
      );
      
      const orderItemId = orderItemResult.insertId;

      // Inserir as customizações (acréscimos) se existirem
      if (item.customizations && item.customizations.length > 0) {
        for (const customization of item.customizations) {
          // O id da customização pode ser o option_id da tabela options
          // Assumindo que customization.id é o id da opção
          await connection.query(
            'INSERT INTO order_item_acrescimo (order_item_id, acrescimo_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderItemId, customization.id, 1, customization.additional_price || 0]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Pedido criado com sucesso!', orderId: orderId });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Erro ao criar pedido:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o pedido.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota para buscar um pedido específico por ID (para a página de acompanhamento)
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId; // ID do usuário logado

    // Buscar detalhes do pedido
    const [orderRows] = await pool.query(
      `SELECT 
         o.id, o.status, o.total_amount AS total, o.delivery_fee AS deliveryFee, 
         o.payment_method AS paymentMethod, o.order_type AS orderType, 
         o.amount_paid AS amountPaid, o.change_amount AS changeAmount, 
         o.payment_status AS paymentStatus, o.created_at AS createdAt,
         u.address AS deliveryAddress, u.id AS customer_id, o.establishment_id
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.id = ? AND o.customer_id = ?`,
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado ou não pertence ao usuário.' });
    }

    const order = orderRows[0];

    // Buscar itens do pedido
    const [itemRows] = await pool.query(
      `SELECT 
         oi.id, oi.product_id AS id, oi.quantity, oi.price,
         p.name, p.description, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // Buscar customizações (acréscimos) para cada item do pedido
    const itemsWithCustomizations = await Promise.all(itemRows.map(async (item) => {
      const [customizationRows] = await pool.query(
        `SELECT 
           o.id, o.name, o.description, CAST(o.additional_price AS DECIMAL(10,2)) AS additional_price
         FROM order_item_acrescimo oia
         JOIN options o ON oia.acrescimo_id = o.id
         WHERE oia.order_item_id = ?`,
        [item.id]
      );
      return { ...item, customizations: customizationRows };
    }));

    // Buscar informações do entregador (mockado ou real, se disponível)
    let deliveryPerson = null;
    if (order.delivery_id) {
      const [deliveryPersonRows] = await pool.query(
        `SELECT id, name FROM users WHERE id = ? AND role = 'DELIVERY'`,
        [order.delivery_id]
      );
      if (deliveryPersonRows.length > 0) {
        deliveryPerson = { 
          id: deliveryPersonRows[0].id,
          name: deliveryPersonRows[0].name,
          photo: 'https://via.placeholder.com/150', // Mock ou buscar URL real
          rating: 4.8 // Mock ou buscar avaliação real
        };
      }
    }

    res.json({
      id: order.id.toString(),
      status: order.status,
      total: Number(order.total),
      deliveryFee: Number(order.deliveryFee),
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      estimatedTime: order.estimatedTime || 35, // Usar 35 como padrão se não houver
      createdAt: order.createdAt,
      establishment_id: order.establishment_id,
      customer_id: order.customer_id,
      amount_paid: order.amountPaid ? Number(order.amountPaid) : undefined,
      change_amount: order.changeAmount ? Number(order.changeAmount) : undefined,
      payment_status: order.paymentStatus,
      order_type: order.orderType,
      items: itemsWithCustomizations.map(item => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price), // Preço unitário do produto
        totalPrice: Number(item.price) * item.quantity + (item.customizations ? item.customizations.reduce((sum, opt) => sum + Number(opt.additional_price), 0) : 0), // Preço total do item com customizações
        image_url: item.image_url,
        customizations: item.customizations.map(cust => ({...cust, additional_price: Number(cust.additional_price)})),
      })),
      deliveryPerson: deliveryPerson
    });

  } catch (err) {
    console.error('Erro ao buscar pedido por ID:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar o pedido.' });
  }
});

// Rota para buscar todos os pedidos de um usuário (para a página "Meus Pedidos")
app.get('/api/users/:userId/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Garante que o usuário logado está buscando seus próprios pedidos
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado aos pedidos de outro usuário.' });
    }

    const [ordersRows] = await pool.query(
      `SELECT 
         o.id, o.status, o.total_amount AS total, o.delivery_fee AS deliveryFee, 
         o.payment_method AS paymentMethod, o.order_type AS orderType, 
         o.amount_paid AS amountPaid, o.change_amount AS changeAmount, 
         o.payment_status AS paymentStatus, o.created_at AS createdAt,
         o.establishment_id
       FROM orders o
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const orders = await Promise.all(ordersRows.map(async (order) => {
      // Para cada pedido, buscar seus itens
      const [itemRows] = await pool.query(
        `SELECT 
           oi.id, oi.product_id AS id, oi.quantity, oi.price,
           p.name, p.description, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const itemsWithCustomizations = await Promise.all(itemRows.map(async (item) => {
        const [customizationRows] = await pool.query(
          `SELECT 
             o.id, o.name, o.description, CAST(o.additional_price AS DECIMAL(10,2)) AS additional_price
           FROM order_item_acrescimo oia
           JOIN options o ON oia.acrescimo_id = o.id
           WHERE oia.order_item_id = ?`,
          [item.id]
        );
        return { ...item, customizations: customizationRows };
      }));

      return {
        id: order.id.toString(),
        status: order.status,
        total: Number(order.total),
        deliveryFee: Number(order.deliveryFee),
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress, // Pode ser null aqui, se não for buscado para a lista
        estimatedTime: order.estimatedTime || 35,
        createdAt: order.createdAt,
        establishment_id: order.establishment_id,
        customer_id: Number(userId),
        amount_paid: order.amountPaid ? Number(order.amountPaid) : undefined,
        change_amount: order.changeAmount ? Number(order.changeAmount) : undefined,
        payment_status: order.paymentStatus,
        order_type: order.orderType,
        items: itemsWithCustomizations.map(item => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.price) * item.quantity + (item.customizations ? item.customizations.reduce((sum, opt) => sum + Number(opt.additional_price), 0) : 0),
          image_url: item.image_url,
          customizations: item.customizations.map(cust => ({...cust, additional_price: Number(cust.additional_price)})),
        })),
        deliveryPerson: null // Não buscar entregador para a lista de pedidos
      };
    }));

    res.json(orders);

  } catch (err) {
    console.error('Erro ao buscar pedidos do usuário:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar pedidos do usuário.' });
  }
});

// Nova rota para submeter avaliação de pedido
app.post('/api/orders/:orderId/rating', authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  const orderId = req.params.orderId;
  const customerId = req.user.userId; // ID do cliente do token JWT

  if (!rating) {
    return res.status(400).json({ message: 'A avaliação (rating) é obrigatória.' });
  }

  try {
    // Verificar se o pedido existe e pertence ao cliente logado
    const [orderRows] = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND customer_id = ?',
      [orderId, customerId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado ou você não tem permissão para avaliá-lo.' });
    }

    // Inserir ou atualizar a avaliação do pedido
    // Para simplificar, faremos um INSERT OR REPLACE INTO para permitir apenas uma avaliação por pedido/cliente
    await pool.query(
      `INSERT INTO order_ratings (order_id, customer_id, rating, comment)
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [orderId, customerId, rating, comment || null]
    );

    res.status(200).json({ message: 'Avaliação do pedido submetida com sucesso!' });

  } catch (err) {
    console.error('Erro ao submeter avaliação do pedido:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao submeter avaliação.' });
  }
});

// Rota para buscar o perfil de um usuário específico
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    let user = rows[0];
    // Tenta converter address para objeto, se for um JSON válido
    if (user.address && typeof user.address === 'string') {
      try {
        const parsed = JSON.parse(user.address);
        user.address = parsed;
      } catch (e) {
        // Se não for JSON válido, mantém como string
      }
    }
    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para atualizar o perfil do usuário
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    // Garante que o usuário logado só pode editar o próprio perfil
    if (req.user.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado para editar este usuário.' });
    }
    const { name, phone, address } = req.body;
    // Atualiza apenas os campos enviados
    const fields = [];
    const values = [];
    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      let addressToSave = address;
      if (typeof address === 'object') {
        try {
          addressToSave = JSON.stringify(address);
        } catch (e) {
          addressToSave = '';
        }
      }
      fields.push('address = ?');
      values.push(addressToSave);
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }
    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
    // Retorna o novo perfil atualizado
    const [rows] = await pool.query('SELECT id, name, email, phone, address, role FROM users WHERE id = ?', [userId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar perfil do usuário:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
  }
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});