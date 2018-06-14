export {
    distance,
    find_angle,
    find_intersection
}

function find_angle (p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * (180 / Math.PI);
}

function find_intersection (path, is_inside, tolerance) {

    tolerance = tolerance || 0.1;

    const length = path.getTotalLength();

    if (length) {

        let n1 = 0;
        let n2 = length;
        let nm = (n1 + n2) / 2;

        const p1 = path.getPointAtLength(n1);
        const p2 = path.getPointAtLength(n2);
        let md = path.getPointAtLength(nm);
        let md_next;

        const is_p1 = is_inside(p1);
        let is_p2 = is_inside(p2);
        let is_md;

        // Start point must be outside shape
        if (is_p1) {
            return p2;
        }

        // End point must be inside shape
        if (!is_p2) {
            return p2;
        }

        // Binary search
        let diff = tolerance;
        while (!(diff < tolerance)) {

            // Is the midpoint inside the shape?
            is_md = is_inside(md);

            // Pick a side
            if (is_md) {
                n2 = nm;
            } else {
                n1 = nm;
            }

            // New distance along path that midpoint falls
            nm = (n1 + n2) / 2;

            // Find the next midpoint
            md_next = path.getPointAtLength(nm);

            // Calculate difference between previous midpoint and src midpoint
            diff = distance(md_next, md);

            // Set the current midpoint
            md = md_next;

        }

        return md;

    }

}

function distance (p1, p2) {

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx*dx + dy*dy);

}