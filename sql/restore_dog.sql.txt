/**
 * Usage:
 * select * from restore_dog('<index_number>')
 *
 * e.g.
 * select * from restore_dog('ED12345')
 */
CREATE OR REPLACE FUNCTION restore_dog(p_index_number varchar) RETURNS varchar AS $$
DECLARE
	v_dog_id integer;
	v_person_id integer;
BEGIN
	SELECT dog_id, person_id
	INTO STRICT v_dog_id, v_person_id
	FROM registered_person
	WHERE dog_id IN
		(SELECT id 
		FROM dog 
		WHERE index_number = restore_dog.p_index_number);

	UPDATE dog
	SET    deleted_at = null
	WHERE  id = v_dog_id;

	UPDATE microchip
	SET    deleted_at = null
	WHERE  id IN
		(SELECT id
		FROM dog_microchip
		WHERE dog_id = v_dog_id);

	UPDATE dog_microchip
	SET    deleted_at = null
	WHERE  dog_id = v_dog_id;

	UPDATE registered_person
	SET    deleted_at = null
	WHERE  dog_id = v_dog_id;

	UPDATE registration
	SET    deleted_at = null
	WHERE  dog_id = v_dog_id;

  IF generate_search_index(v_person_id, v_dog_id) = 'OK' THEN
  	RETURN 'Dog successfully restored';
  ELSE
    RETURN 'Failed';
  END IF;
END;
$$ LANGUAGE plpgsql;
