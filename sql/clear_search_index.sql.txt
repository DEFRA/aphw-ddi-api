CREATE OR REPLACE PROCEDURE clear_search_index(p_person_id integer, p_dog_id integer) AS $$
DECLARE
	v_index_count integer;
BEGIN
	IF p_person_id IS NOT NULL AND p_dog_id IS NULL THEN
		SELECT count(*)
		INTO v_index_count
		FROM search_index
		WHERE person_id = p_person_id
		AND dog_id IS NULL;

		IF v_index_count > 0 THEN
			DELETE FROM search_index
			WHERE dog_id IS NULL
			AND person_id = p_person_id;
		END IF;
	END IF;

	IF p_person_id IS NOT NULL AND p_dog_id IS NOT NULL THEN
		SELECT count(*)
		INTO v_index_count
		FROM search_index
		WHERE (dog_id = p_dog_id OR dog_id IS NULL)
		AND person_id = p_person_id;

		IF v_index_count > 0 THEN
			DELETE FROM search_index
			WHERE (dog_id = p_dog_id OR dog_id IS NULL)
			AND person_id = p_person_id;
		END IF;
	END IF;
END;
$$ LANGUAGE plpgsql;
