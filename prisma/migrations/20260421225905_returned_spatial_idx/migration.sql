-- CreateIndex
CREATE INDEX "locations_coords_idx" ON "locations" USING GIST ("coords");
