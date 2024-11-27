<?php
// Conexión a la base de datos
$host = 'localhost';
$dbname = 'luminar';
$username = 'root';
$password = '';

// Crear conexión
$conn = new mysqli($host, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Consulta para obtener todos los usuarios
$query = "SELECT nombre, apellido, correo_electronico, rol_id, estado, fecha_registro, ultimo_acceso, imagen_perfil FROM Usuarios";
$result = $conn->query($query);

// Verificar si hay resultados
$usuarios = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convertir la imagen en binario a Base64 para enviarla en JSON
        if (!empty($row['imagen_perfil'])) {
            $row['imagen_perfil'] = 'data:image/jpeg;base64,' . base64_encode($row['imagen_perfil']);
        }
        $usuarios[] = $row;
    }
}

// Devolver los usuarios en formato JSON
echo json_encode($usuarios);

// Cerrar conexiones
$conn->close();
?>
