/**
 * Usage:
 * select * from restore_owner('<person_reference>')
 *
 * e.g.
 * select * from restore_owner('P-1234-5678')
 */
CREATE OR REPLACE FUNCTION restore_owner(p_owner_reference varchar) RETURNS varchar AS $$
DECLARE
	v_person_id integer;
BEGIN
	SELECT person_id
	INTO STRICT v_person_id
	FROM registered_person
	WHERE person_id IN
		(SELECT id 
		FROM person 
		WHERE person_reference = restore_owner.p_owner_reference);

	UPDATE person
	SET    deleted_at = null
	WHERE  id = v_person_id;

	UPDATE address
	SET    deleted_at = null
	WHERE  id IN
		(SELECT id
		FROM person_address
		WHERE person_id = v_person_id);

	UPDATE person_address
	SET    deleted_at = null
	WHERE  person_id = v_person_id;

	UPDATE contact
	SET    deleted_at = null
	WHERE  id IN
		(SELECT contact_id
		FROM person_contact
		WHERE person_id = v_person_id);

	UPDATE person_contact
	SET    deleted_at = null
	WHERE  person_id = v_person_id;

	UPDATE registered_person
	SET    deleted_at = null
	WHERE  person_id = v_person_id;

  IF generate_search_index(v_person_id, null) = 'OK' THEN
  	RETURN 'Person successfully restored';
  ELSE
    RETURN 'Failed';
  END IF;
END;
$$ LANGUAGE plpgsql;
