-- Create spatial index for locations
CREATE INDEX "location_coords_idx" ON "locations" USING GIST ("coords");
