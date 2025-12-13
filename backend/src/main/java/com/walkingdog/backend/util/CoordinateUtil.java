package com.walkingdog.backend.util;

import org.locationtech.proj4j.*;

public class CoordinateUtil {

    private static CRSFactory factory;
    private static CoordinateTransform transform;
    private static CoordinateTransform reverseTransform;
    
    private static synchronized void init() {
        if (factory == null) {
            try {
                factory = new CRSFactory();
                transform = new CoordinateTransformFactory().createTransform(
                        factory.createFromName("EPSG:4326"),
                        factory.createFromName("EPSG:5179")
                );
                reverseTransform = new CoordinateTransformFactory().createTransform(
                        factory.createFromName("EPSG:5179"),
                        factory.createFromName("EPSG:4326")
                );
            } catch (Exception e) {
                throw new RuntimeException("좌표 변환 초기화 실패", e);
            }
        }
    }

    public static double[] toTM(double lat, double lon) {
        init();
        ProjCoordinate src = new ProjCoordinate(lon, lat);
        ProjCoordinate dst = new ProjCoordinate();
        transform.transform(src, dst);
        return new double[]{dst.x, dst.y};
    }
    
    public static double[] toWGS84(double tmX, double tmY) {
        init();
        ProjCoordinate src = new ProjCoordinate(tmX, tmY);
        ProjCoordinate dst = new ProjCoordinate();
        reverseTransform.transform(src, dst);
        return new double[]{dst.y, dst.x}; // lat, lon 순서로 반환
    }
}
