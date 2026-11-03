class CorsMiddleware
  ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS".freeze
  ALLOWED_HEADERS = "Accept, Content-Type, Authorization".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    origin = env["HTTP_ORIGIN"]
    return @app.call(env) unless allowed_origin?(origin)

    return [ 204, cors_headers(origin), [] ] if env["REQUEST_METHOD"] == "OPTIONS"

    status, headers, body = @app.call(env)
    [ status, headers.merge(cors_headers(origin)), body ]
  end

  private

  def allowed_origin?(origin)
    request_origin = normalize_origin(origin)
    configured_origin = normalize_origin(ENV["FRONTEND_URL"])

    !request_origin.empty? && !configured_origin.empty? && request_origin == configured_origin
  end

  def normalize_origin(origin)
    origin.to_s.strip.chomp("/")
  end

  def cors_headers(origin)
    {
      "Access-Control-Allow-Origin" => origin,
      "Access-Control-Allow-Methods" => ALLOWED_METHODS,
      "Access-Control-Allow-Headers" => ALLOWED_HEADERS,
      "Access-Control-Max-Age" => "86400",
      "Vary" => "Origin"
    }
  end
end
