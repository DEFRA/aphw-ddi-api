CREATE OR REPLACE FUNCTION generate_search_index(p_person_id integer, p_dog_id integer) RETURNS varchar AS $$
DECLARE
	v_search_json varchar := '';
	v_search_string varchar := '';
	v_person_rec person%rowtype;
	v_dog_rec dog%rowtype;
	v_address_rec address%rowtype;
	v_microchips RECORD;
	v_microchip1 varchar := '';
	v_microchip2 varchar := '';
	v_microchip_loop_count integer := 1;
	v_status varchar := '';
BEGIN
  CALL clear_search_index(p_person_id, p_dog_id);

	IF p_person_id IS NOT NULL THEN
		SELECT *
		INTO STRICT v_person_rec
		FROM person
		WHERE id = p_person_id;
		
		SELECT a.*
		INTO STRICT v_address_rec
		FROM address a, person_address pa
		WHERE pa.person_id = p_person_id
		AND   pa.address_id = a.id
		AND   pa.id = (SELECT max(pa2.id)
						FROM person_address pa2
						WHERE pa2.person_id = p_person_id);
	END IF;

	IF p_dog_id IS NOT NULL THEN
		SELECT *
		INTO STRICT v_dog_rec
		FROM dog
		WHERE id = p_dog_id;
		
    SELECT status
    INTO STRICT v_status
    FROM status
    WHERE id = v_dog_rec.status_id;

		FOR v_microchips IN
			SELECT m.microchip_number
			FROM microchip m, dog_microchip dm
			WHERE dm.dog_id = p_dog_id
			AND   dm.microchip_id = m.id
			ORDER BY dm.microchip_id
    LOOP
			IF v_microchip_loop_count = 1 THEN
				v_microchip1 := v_microchips.microchip_number;
			ELSIF v_microchip_loop_count = 2 THEN
				v_microchip2 := v_microchips.microchip_number;
			END IF;
			v_microchip_loop_count := v_microchip_loop_count + 1;
		END LOOP;
	END IF;

	--TODO - add organisation if applicable
	v_search_string := concat(
		v_person_rec.person_reference || ' ',
		v_person_rec.first_name || ' ',
		v_person_rec.last_name || ' ',
		v_address_rec.address_line_1 || ' ',
		v_address_rec.address_line_2 || ' ',
		v_address_rec.town || ' ',
		v_address_rec.postcode || ' ',
		v_dog_rec.index_number || ' ',
		v_dog_rec.name || ' ',
		v_microchip1 || ' ',
		v_microchip2);

	v_search_json := '{' ||
		concat(
		'"personReference": "' || v_person_rec.person_reference || '", ',
		'"firstName": "' || v_person_rec.first_name || '", ',
		'"lastName": "' || v_person_rec.last_name || '", ',
		'"address": { ',
		concat('"address_line_1": "' || v_address_rec.address_line_1 || '", ',
				'"address_line_2": "' || v_address_rec.address_line_2 || '", ',
				'"town": "' || v_address_rec.town || '", ',
				'"postcode": "' || v_address_rec.postcode || '"'),
		'}');
		IF p_dog_id IS NOT NULL THEN
			v_search_json := v_search_json || ',' ||
			concat(
			'"dogIndex": "' || v_dog_rec.index_number || '", ',
			'"dogName": "' || v_dog_rec.name || '", ',
			'"microchipNumber": "' || v_microchip1 || '", ',
			'"microchipNumber2": "' || v_microchip2 || '", ',
      '"dogStatus": "' || v_status || '"');
		END IF;	
	v_search_json := v_search_json || '}';

	INSERT INTO search_index
	(search,
	 json,
	 person_id,
	 dog_id)
	VALUES
	(to_tsvector(trim(v_search_string)),
	 trim(v_search_json)::jsonb,
 	 p_person_id,
	 p_dog_id);

	RETURN 'OK';
END;
$$ LANGUAGE plpgsql;
