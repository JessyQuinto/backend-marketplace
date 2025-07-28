# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages.
  # We are ensuring git and git-filter-repo are both included.
  packages = [
    pkgs.nodejs_20
    pkgs.git
    pkgs.git-filter-repo
  ];

  # Sets environment variables in the workspace.
  env = {};

  # IDX-specific configuration.
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id".
    extensions = [
      # e.g., "vscodevim.vim"
    ];

    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file.
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress";
      };

      # Runs when a workspace is (re)started.
      onStart = {
        # The 'npm run dev' script is defined in package.json
        run-server = "npm run dev";
      };
    };
  };
}
