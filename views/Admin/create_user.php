<?php
// Conexión a la base de datos
$host = '127.0.0.1';
$dbname = 'luminar';
$username = 'root';
$password = '';

// Crear conexión
$conn = new mysqli($host, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener los datos JSON del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Asignar valores desde los datos recibidos
$nombre = $data['nombre'];
$apellido = $data['apellido'];
$email = $data['email'];
$rol_id = $data['rol'];
$estado = $data['estado'];

// Convertir la imagen Base64 a binario si existe
$imagen_perfil = null;
if (!empty($data['imagen'])) {
    $imagen_perfil = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data['imagen']));
}

// Preparar y enlazar la consulta SQL
$stmt = $conn->prepare("INSERT INTO Usuarios (nombre, apellido, correo_electronico, rol_id, estado, imagen_perfil) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssb", $nombre, $apellido, $email, $rol_id, $estado, $imagen_perfil);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(["message" => "Usuario creado exitosamente"]);
} else {
    echo json_encode(["message" => "Error al crear el usuario"]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>
