@tool
extends CharacterBody3D
class_name Player
## The player's sprout, walking the reserve.

signal hit(damage: int)

const MAX_SPEED := 6.0
@export var jump_height: float = 1.5
@onready var camera: Camera3D = $Camera

func _physics_process(delta: float) -> void:
	var input := Input.get_vector("left", "right", "up", "down")
	velocity.x = input.x * MAX_SPEED
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = sqrt(2.0 * jump_height * 9.8)
	print("speed %.2f" % velocity.length())
	self.move_and_slide()
