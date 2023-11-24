ALTER TABLE dog 
    ADD COLUMN index_number VARCHAR(20) 
    GENERATED ALWAYS AS ('ED' || index_number_base::TEXT) STORED;
