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

// Preparar y enlazar la consulta SQL
$stmt = $conn->prepare("INSERT INTO Ordenes (cliente_id, usuario_id,codigo_orden ,fecha_entrega_estimada ,subtotal ,impuestos ,descuento ,total ,estado ,direccion_envio ,notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iissddddsss", $cliente_id,$usuario_id,$codigo_orden,$fecha_entrega_estimada,$subtotal,$impuestos,$descuento,$total,$estado,$direccion_envio,$notas);

// Asignar valores desde los datos recibidos
$cliente_id= $data['cliente_id'];
$usuario_id= $data['usuario_id'];
$codigo_orden= $data['codigo_orden'];
$fecha_entrega_estimada= $data['fecha_entrega_estimada'];
$subtotal= $data['subtotal'];
$impuestos= $data['impuestos'];
$descuento= $data['descuento'];
$total= $data['total'];
$estado= $data['estado'];
$direccion_envio= $data['direccion_envio'];
$notas= $data['notas'];

// Ejecutar la consulta
if ($stmt->execute()) {
	echo json_encode(["message" => "Orden creada exitosamente"]);
} else {
	echo json_encode(["message" => "Error al crear la orden"]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>