require 'rubygems'
require 'jammit'

# 
# USAGE:
#   rake build
# With version Parameter:
#   rake build[0.5.0]
#

# Think before you change - this directory is removed!!!
BUILDDIR = "build"
SRC = "backbone.stickit.js"
SRC_MIN = "backbone.stickit.min.js"

desc "minify source with jammit; build the docs; package the build"
task :build, [:version] do |t, args|

	puts "Building version #{args.version} to #{BUILDDIR}/"

	FileUtils.rm_rf BUILDDIR, :verbose => true

	Jammit.package!({
		:config_path   => "assets.yml",
		:output_folder => BUILDDIR
	})
	
	# Copy the short license to the top of the build files.
	copy_license SRC, "#{BUILDDIR}/#{SRC}", args.version
	copy_license "#{BUILDDIR}/#{SRC_MIN}", "#{BUILDDIR}/#{SRC_MIN}", args.version

	# Create the docs.
	system "mkdir -p #{BUILDDIR}/docs/annotated"
	system "rocco #{BUILDDIR}/#{SRC}"
	system "mv #{BUILDDIR}/backbone.stickit.html #{BUILDDIR}/docs/annotated/index.html"

	# Zip it all up.
	system "zip -r #{BUILDDIR}/backbone.stickit_#{args.version}.zip #{BUILDDIR}"
end

def copy_license(from, to, version)
	File.open(BUILDDIR + "/temp.js","w") do |tempfile|
		tempfile.puts "//\n// backbone.stickit v#{version}"
		tempfile.puts File.read("LICENSE.js")
		tempfile.puts File.read(from)
	end
	FileUtils.mv BUILDDIR + "/temp.js", to
end
