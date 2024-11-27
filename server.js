const express = require('express');
const path = require('path');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const hbs = require('hbs'); // Importa Handlebars
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);




const app = express();

io.on('connection', (socket) => {
  console.log('Administrador conectado');
});

// Configuración del motor de plantillas Handlebars
app.set('view engine', 'hbs'); // Establece Handlebars como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // Define la carpeta de vistas

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


app.post('/api/register', async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;

        // Verifica si el usuario ya existe
        const existingUser = await models.User.findOne({ where: { correo_electronico: email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea el usuario en la base de datos
        const newUser = await models.User.create({
            nombre,
            correo_electronico: email,
            contrasena: hashedPassword,
            rol_id,
            estado: 1,  // Ejemplo: estado activo por defecto
            fecha_registro: new Date()  // Establece la fecha de registro actual
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUser.usuario_id });
    } catch (error) {
        console.error('Error en el registro de usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: 'Unauthorized!' });
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    });
};

app.post('/usuarios', (req, res) => {
    const { nombre, apellido, correo_electronico, contrasena, rol_id, estado } = req.body;
    const query = `INSERT INTO Usuarios (nombre, apellido, correo_electronico, contrasena, rol_id, estado)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [nombre, apellido, correo_electronico, contrasena, rol_id, estado], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Usuario creado correctamente' });
    });
});

app.get('/usuarios', (req, res) => {
    const query = `SELECT * FROM Usuarios`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo_electronico, rol_id, estado } = req.body;
    const query = `UPDATE Usuarios SET nombre = ?, apellido = ?, correo_electronico = ?, rol_id = ?, estado = ? WHERE usuario_id = ?`;
    db.query(query, [nombre, apellido, correo_electronico, rol_id, estado, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario actualizado correctamente' });
    });
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM Usuarios WHERE usuario_id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario eliminado correctamente' });
    });
});


// Configuración de la base de datos
const sequelize = new Sequelize('Luminar', 'root', 'SEBAS2002sara723', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Inicializar modelos
const initModels = require('./models/init-models');
const models = initModels(sequelize);

// Middleware para pasar los modelos a las rutas
app.use((req, res, next) => {
    req.models = models;
    next();
});

// Definir rutas disponibles para la API
const availableRoutes = {
    'role': '/api/roles',
    'product': '/api/productos',
    'cart': '/api/cart',
    'client': '/api/clients',
    'order': '/api/orders',
    'payment': '/api/payments',
    'category': '/api/categories',
    'user': '/api/users',
    'orderDetail': '/api/orderDetails',
    'whishlist': '/api/wishlist'
};

// Función para cargar rutas de manera segura
function loadRoute(routeName) {
    try {
        return require(`./routes/${routeName}.routes.js`)(models);
    } catch (error) {
        console.warn(`Ruta ${routeName} no encontrada`);
        return express.Router();
    }
}


// Configurar rutas API
Object.entries(availableRoutes).forEach(([routeName, path]) => {
    app.use(path, loadRoute(routeName));
});


// Proteger rutas de dashboards
app.get('/dashboard-admin', verifyToken, (req, res) => {
    if (req.userRole !== 1) return res.status(403).send({ message: 'Require Admin Role!' });
    res.sendFile(path.join(__dirname, 'views/Admin/dashboard-admin.html'));
});

app.get('/indexCliente', verifyToken, (req, res) => {
    if (req.userRole !== 2) return res.status(403).send({ message: 'Require Client Role!' });
    res.sendFile(path.join(__dirname, 'views/Cliente/indexCliente.html'));
});

app.get('/vendedor/dashboard', verifyToken, (req, res) => {
    if (req.userRole !== 3) return res.status(403).send({ message: 'Require Vendor Role!' });
    res.sendFile(path.join(__dirname, 'views/Vendedor/dashboard-vendedor.html'));
});


// Configurar rutas de vistas (HTML y HBS)
const viewRoutes = {
    '/': 'views/login-register.html',
    '/index': 'views/index.html',
    
    // Rutas para Cliente
    '/indexCliente': 'views/Cliente/indexCliente.html',
    '/cartCliente': 'views/Cliente/cartCliente.html',
    '/detailsCliente': 'views/Cliente/detailsCliente.html',
    '/editarperfilCliente': 'views/Cliente/editarperfilCliente.html',
    '/ordersCliente': 'views/Cliente/ordersCliente.html',
    '/shopCliente': 'views/Cliente/shopCliente.html',
    '/whishlistCliente': 'views/Cliente/whishlistCliente.html',
    
    // Rutas para Vendedor
    '/vendedor/clientes': 'views/Vendedor/clientes.html',
    '/vendedor/dashboard': 'views/Vendedor/dashboard-vendedor.html',
    '/vendedor/editar-perfil': 'views/Vendedor/editar-perfil.html',
    '/vendedor/inventario': 'views/Vendedor/inventario.html',
    '/vendedor/reportes': 'views/Vendedor/reportes.html',
    '/vendedor/ventas': 'views/Vendedor/ventas.html',
    '/vendedor/nueva-venta': 'views/Vendedor/nueva-venta.html',
    '/vendedor/nuevo-cliente': 'views/Vendedor/nuevo-cliente.html',
    '/vendedor/nuevo-producto': 'views/Vendedor/nuevo-producto.html',
    
    // Rutas para Admin
    '/dashboard-admin': 'views/Admin/dashboard-admin.html',
    '/admin/roles': 'views/Admin/roles.html',
    '/admin/clientes': 'views/Admin/clientes.html',
    '/admin/config': 'views/Admin/config-admin.html',
    '/admin/editar-perfil': 'views/Admin/editar-perfil.html',
    '/admin/inventario': 'views/Admin/inventario.html',
    '/admin/notificaciones': 'views/Admin/notificaciones.html',
    '/admin/ordenes': 'views/Admin/ordenes.html',
    '/admin/pedidos': 'views/Admin/pedidos.html',
    '/admin/productos': 'views/Admin/productos.html',
    '/admin/reportes': 'views/Admin/reportes.html',
    '/admin/usuarios': 'views/Admin/usuarios.html',
    '/admin/ventas': 'views/Admin/ventas.html',

    // Rutas adicionales
    '/privacy-policy': 'views/privacy-policy.html',
    '/indexPortal': 'views/indexPortal.html',
    '/shopPortal': 'views/shopPortal.html',
    '/details': 'views/details.html',

};

 

// Agregar ruta específica para roles usando Handlebars
app.get('/admin/roles', async (req, res) => {
    try {
        const roles = await req.models.Role.findAll({ order: [['rol_id', 'ASC']] });
        res.render('roles', { roles }); // Renderiza la vista roles.hbs con los datos obtenidos
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).send('Error al obtener roles');
    }
});

app.get('/vendedor/cliente', async (req, res) => {
    try {
        const clientes = await req.models.User.findAll({
            attributes: ['usuario_id', 'nombre', 'correo_electronico', 'fecha_registro', 'estado']
        });
        res.render('clientes', { clientes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuarios');
    }
});


// Configurar otras rutas de vistas (HTML)
Object.entries(viewRoutes).forEach(([route, file]) => {
   app.get(route, (req, res) => {
       res.sendFile(path.join(__dirname, file.includes('.html') ? file : `views/${file}`));
   });
});


// Manejo de errores 404 y registro de la ruta no encontrada
app.use((req, res, next) => {
   const error = new Error('Not found');
   error.status = 404;
   console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
   next(error);
});

// Manejo de errores global
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(err.status || 500).json({ 
       error: {
           message: err.message,
           status: err.status,
           stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
       }
   });
});

// Ruta de autenticación
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await models.User.findOne({ where: { correo_electronico: email } });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.contrasena);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.usuario_id, role: user.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.rol_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


// Función para inicializar el servidor
async function initializeServer() {
   try {
       await sequelize.authenticate();
       console.log('Conexión a la base de datos establecida.');
       
       await sequelize.sync({ alter: true });
       console.log('Modelos sincronizados.');
       
       const PORT = process.env.PORT || 5000;
       app.listen(PORT, () => {
           console.log(`Servidor corriendo en puerto ${PORT}`);
           console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
       });
   } catch (error) {
       console.error('Error de inicialización:', error);
       process.exit(1);
   }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
   console.error('Uncaught Exception:', error);
   process.exit(1);
});

initializeServer();

module.exports = app;