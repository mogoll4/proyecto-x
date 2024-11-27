<?php
// Mostrar errores de PHP para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar encabezado JSON
header('Content-Type: application/json');

// Conexión a la base de datos
$host = '127.0.0.1';
$dbname = 'luminar';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Obtener los datos JSON del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Preparar y enlazar la consulta SQL
$stmt = $conn->prepare("INSERT INTO Clientes (nombre, apellido, correo_electronico, telefono, direccion, ciudad, codigo_postal, fecha_registro, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)");
$stmt->bind_param("sssssssss", $nombre, $apellido, $email, $telefono, $direccion, $ciudad, $codigo_postal, $fecha_nacimiento, $genero);

// Asignar valores desde los datos recibidos
$nombre = $data['nombre'];
$apellido = $data['apellido'];
$email = $data['email'];
$telefono = $data['telefono'];
$direccion = $data['direccion'];
$ciudad = $data['ciudad'];
$codigo_postal = $data['codigo_postal'];
$fecha_nacimiento = $data['fecha_nacimiento'];
$genero = $data['genero'];

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(["message" => "Cliente creado exitosamente"]);
} else {
    echo json_encode(["error" => "Error al crear el cliente"]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>