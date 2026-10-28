import * as THREE from 'three';
export const DEG=Math.PI/180;
export const START=Date.UTC(2026,0,1),YEAR=365.2422*86400000;
export function astronomy(time,lat=31.23,lon=121.47){
 const jd=time/86400000+2440587.5,d=jd-2451545;
 const g=(357.529+0.98560028*d)*DEG,L=(280.459+0.98564736*d)*DEG;
 const lambda=L+(1.915*Math.sin(g)+.020*Math.sin(2*g))*DEG;
 const ob=23.5*DEG,ra=Math.atan2(Math.cos(ob)*Math.sin(lambda),Math.cos(lambda));
 const dec=Math.asin(Math.sin(ob)*Math.sin(lambda));
 const sidereal=((280.46061837+360.98564736629*d)%360)*DEG;
 const subLon=Math.atan2(Math.sin(ra-sidereal),Math.cos(ra-sidereal))/DEG;
 const alt=Math.asin(Math.sin(lat*DEG)*Math.sin(dec)+Math.cos(lat*DEG)*Math.cos(dec)*Math.cos((lon-subLon)*DEG))/DEG;
 return {dec:dec/DEG,subLon,alt,lambda,sidereal,distance:1.00014-.01671*Math.cos(g)-.00014*Math.cos(2*g)};
}
export function geoVector(lat,lon,r=1){return new THREE.Vector3(r*Math.cos(lat*DEG)*Math.cos(lon*DEG),r*Math.sin(lat*DEG),-r*Math.cos(lat*DEG)*Math.sin(lon*DEG));}
