CREATE OR REPLACE FUNCTION generate_index_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.index_number := 'ED' || NEW.index_number_base::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cdo_create_trigger
BEFORE INSERT OR UPDATE ON dog
FOR EACH ROW EXECUTE FUNCTION generate_index_number();
