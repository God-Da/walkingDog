package com.walkingdog.backend.util;

import org.locationtech.proj4j.*;

public class CoordinateUtil {

    private static final CRSFactory factory = new CRSFactory();
    private static final CoordinateTransform transform =
            new CoordinateTransformFactory().createTransform(
                    factory.createFromName("EPSG:4326"),
                    factory.createFromName("EPSG:5179")
            );

    public static double[] toTM(double lat, double lon) {
        ProjCoordinate src = new ProjCoordinate(lon, lat);
        ProjCoordinate dst = new ProjCoordinate();
        transform.transform(src, dst);
        return new double[]{dst.x, dst.y};
    }
}
