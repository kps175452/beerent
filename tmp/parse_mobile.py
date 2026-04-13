import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

with open(
    r"C:\Users\ASUS\.local\share\opencode\tool-output\tool_d845e8930001PpG3N4p3Knnubx",
    "r",
    encoding="utf-8",
) as f:
    data = json.load(f)

OX = data["bounds"]["x"]
OY = data["bounds"]["y"]


def get_fills(styles):
    fills = styles.get("fills", [])
    parts = []
    for fl in fills:
        if isinstance(fl, str):
            parts.append(fl)
            continue
        ft = fl.get("type", "")
        if ft == "SOLID":
            parts.append("solid:" + str(fl.get("color", "?")))
        elif ft == "IMAGE":
            parts.append("img:" + str(fl.get("imageHash", "?"))[:12])
        elif ft == "GRADIENT_LINEAR":
            gs = fl.get("gradientStops", [])
            cols = [str(s.get("color", "?")) for s in gs]
            parts.append("grad:" + ",".join(cols))
        elif ft:
            parts.append(ft)
    return ",".join(parts)


def extract(node, depth=0):
    indent = "  " * depth
    name = node.get("name", "?")
    ntype = node.get("type", "?")
    nid = node.get("id", "?")
    bounds = node.get("bounds", {})
    styles = node.get("styles", {})

    w = bounds.get("width", 0)
    h = bounds.get("height", 0)
    x = bounds.get("x", 0) - OX
    y = bounds.get("y", 0) - OY

    info = (
        indent
        + ntype
        + ' "'
        + name
        + '" ['
        + nid
        + "] ("
        + str(int(x))
        + ","
        + str(int(y))
        + ") "
        + str(int(w))
        + "x"
        + str(int(h))
    )

    if ntype == "TEXT":
        text = node.get("characters", "").replace("\r\n", "\\n").replace("\n", "\\n")
        fs = styles.get("fontSize", "")
        ff = styles.get("fontFamily", "")
        fw = styles.get("fontWeight", "")
        lh = styles.get("lineHeight", "")
        ls = styles.get("letterSpacing", "")
        ta = styles.get("textAlignHorizontal", "")
        fills_str = get_fills(styles)
        print(
            info
            + ' | text="'
            + text[:200]
            + '" font='
            + str(ff)
            + "/"
            + str(fs)
            + "/"
            + str(fw)
            + " lh="
            + str(lh)
            + " ls="
            + str(ls)
            + " align="
            + str(ta)
            + " fills=["
            + fills_str
            + "]"
        )
    elif ntype in ("RECTANGLE", "ELLIPSE"):
        cr = styles.get("cornerRadius", 0)
        fills_str = get_fills(styles)
        print(info + " | corner=" + str(cr) + " fills=[" + fills_str + "]")
    elif ntype == "FRAME":
        al = styles.get("autoLayout", {})
        fills_str = get_fills(styles)
        dir_ = al.get("direction", "NONE")
        gap = al.get("gap", 0)
        pa = al.get("primaryAxisAlign", "?")
        ca = al.get("counterAxisAlign", "?")
        ps = al.get("primaryAxisSizing", "?")
        cs = al.get("counterAxisSizing", "?")
        padL = al.get("paddingLeft", 0)
        padR = al.get("paddingRight", 0)
        padT = al.get("paddingTop", 0)
        padB = al.get("paddingBottom", 0)
        print(
            info
            + " | layout="
            + str(dir_)
            + " gap="
            + str(gap)
            + " pAlign="
            + str(pa)
            + " cAlign="
            + str(ca)
            + " pSize="
            + str(ps)
            + " cSize="
            + str(cs)
            + " pad="
            + str(padT)
            + "/"
            + str(padR)
            + "/"
            + str(padB)
            + "/"
            + str(padL)
            + " fills=["
            + fills_str
            + "]"
        )
    elif ntype == "INSTANCE":
        fills_str = get_fills(styles)
        print(info + " | fills=[" + fills_str + "]")
    else:
        fills_str = get_fills(styles)
        print(info + " | fills=[" + fills_str + "]")

    for child in node.get("children", []):
        extract(child, depth + 1)


extract(data)
