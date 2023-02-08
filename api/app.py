from chalice import Chalice, Response
from pathlib import Path
from aws_lambda_powertools import Logger


XPI_CONTENT_TYPE = "application/x-xpinstall"

app = Chalice(app_name='summarizer-api')
app.api.binary_types.append(XPI_CONTENT_TYPE)


logger = Logger("summarizer-api")


@app.route("/xpi")
def serve_xpi():
    path = Path(__file__).parent / "chalicelib" / "summarizer-dev.xpi"
    body = path.read_bytes()
    logger.info("serving xpi")
    return Response(
        body=body, status_code=200, headers={"Content-Type": "application/x-xpinstall"}
    )


@app.route("/")
def index():
    request = app.current_request
    logger.info(
        "fetching index",
        extra={
            "stage_vars": request.stage_vars,
            "context": request.context,
        },
    )
    stage = request.context.get("stage")
    href = f"/{stage}/xpi" if stage else "/xpi"
    body = f"""
        <div id="example-option-1" class="install-ok">
            <a href="{href}">
              Install my add-on
            </a>
          </div>
           """
    return Response(body=body, status_code=200, headers={"Content-Type": "text/html"})
