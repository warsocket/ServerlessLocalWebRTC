#!/usr/bin/env python3
import os
import sys
import http.server
import json

script_dir = os.path.dirname(sys.argv[0])
if script_dir: os.chdir(script_dir)

HandlerClass = http.server.SimpleHTTPRequestHandler

# Patch in the correct extensions
HandlerClass.extensions_map['.js'] = 'application/javascript'
HandlerClass.extensions_map['.mjs'] = 'application/javascript'
HandlerClass.extensions_map['.png'] = 'image/png'
HandlerClass.extensions_map['.wav'] = 'audio/wav'


#statics
offer = {}
answer = {}


class CustomHandler(HandlerClass):

	def do_GET(self):
		if not self.custom(): return super().do_GET()

	def do_POST(self):
		if not self.custom(): return super().do_POST()



	def custom(self):

		def api(self):
			self.send_response(200)
			self.send_header('Content-type','text/plain')
			self.end_headers()
			header = self.headers
			self.wfile.write(header.encode("ascii"))


		def do_OFFER(self):
			global offer

			if self.command == "GET":
				self.send_response(200)
				self.end_headers()
				o, offer = offer, {}
				self.wfile.write(json.dumps(o).encode("ascii"))


			elif self.command == "POST":

				try:
					length = int(self.headers['Content-Length'])
					
					data = self.rfile.read(length)
					offer = json.loads(data)

					self.send_response(201)
				except:
					self.send_response(415)

				self.end_headers()



		def do_ANSWER(self):
			global answer

			if self.command == "GET":
				self.send_response(200)
				self.end_headers()
				a, answer = answer, {}
				self.wfile.write(json.dumps(a).encode("ascii"))



			elif self.command == "POST":

				try:
					length = int(self.headers['Content-Length'])
					
					data = self.rfile.read(length)
					answer = json.loads(data)

					self.send_response(201)
				except:
					self.send_response(415)

				self.end_headers()



		handlers = {"/api":api, "/offer":do_OFFER, "/answer":do_ANSWER}




		if self.path in handlers:
			handlers[self.path](self)
			return True

		return None



# Run the server (like `python -m http.server` does)
# http.server.test(CustomHandler, port=8080)
if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", 8080), CustomHandler)
    server.serve_forever()
