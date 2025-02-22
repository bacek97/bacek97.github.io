
# Download OpenWRT-x64 and unpack it
# https://downloads.openwrt.org/releases/24.10.0/targets/x86/64/openwrt-24.10.0-x86-64-generic-squashfs-combined.img.gz

# Convert .img to .vdi
# "C:\Program Files\Oracle\VirtualBox\VBoxManage" convertfromraw --format VDI OPENWR~1.IMG openwrt.vdi

# Create new VBox machine and set 3 network adapters: 
# 1. Виртуальный адаптер хоста		(будет использоваться для SSH и Luci)
# 2. NAT							(будет использоваться для прямого доступа в инетрнет самим роутером)
# 3. Внутренняя сеть				(будет использоваться для подключения других vbox машин)

# Setting for connect to SSH
# uci set network.lan.ipaddr='192.168.56.2'; uci commit; service network restart


# https://github.com/yggdrasil-network/public-peers/blob/master/europe/russia.md
# https://publicpeers.neilalexander.dev/
# // quic://ygg-msk-1.averyan.ru:8364

opkg install luci-i18n-tor-ru luci-proto-yggdrasil

# Configure Tor client
cat << EOF > /etc/tor/custom
AutomapHostsOnResolve 1
AutomapHostsSuffixes .
VirtualAddrNetworkIPv4 172.16.0.0/12
VirtualAddrNetworkIPv6 [fc00::]/8
DNSPort 0.0.0.0:9053
DNSPort [::]:9053
TransPort 0.0.0.0:9040
TransPort [::]:9040
EOF
cat << EOF >> /etc/sysupgrade.conf
/etc/tor
EOF
uci del_list tor.conf.tail_include="/etc/tor/custom"
uci add_list tor.conf.tail_include="/etc/tor/custom"
uci commit tor
service tor restart

# Intercept DNS traffic
uci -q del firewall.dns_int
uci set firewall.dns_int="redirect"
uci set firewall.dns_int.name="Intercept-DNS"
uci set firewall.dns_int.family="any"
uci set firewall.dns_int.proto="tcp udp"
uci set firewall.dns_int.src="adapter3Zone"
uci set firewall.dns_int.src_dport="53"
uci set firewall.dns_int.target="DNAT"
uci commit firewall
service firewall restart

# Enable DNS over Tor
# service dnsmasq stop
# uci set dhcp.@dnsmasq[0].noresolv="1"
# uci set dhcp.@dnsmasq[0].rebind_protection="0"
# uci -q delete dhcp.@dnsmasq[0].server
# uci add_list dhcp.@dnsmasq[0].server="127.0.0.1#9053"
# uci add_list dhcp.@dnsmasq[0].server="::1#9053"
# uci commit dhcp
# service dnsmasq start

# Enable DNS over Tor
service dnsmasq stop
uci set dhcp.@dnsmasq[0].noresolv="0"
uci set dhcp.@dnsmasq[0].rebind_protection="1"
uci -q delete dhcp.@dnsmasq[0].server
uci commit dhcp
service dnsmasq start

# Enable DNS over Tor
service dnsmasq stop
uci add dhcp dnsmasq
uci set dhcp.@dnsmasq[1].interface='adapter3'
uci set dhcp.@dnsmasq[1].noresolv="1"
uci set dhcp.@dnsmasq[1].rebind_protection="0"
uci -q delete dhcp.@dnsmasq[1].server
uci add_list dhcp.@dnsmasq[1].server="192.168.3.1#9053"
uci commit dhcp
service dnsmasq start

# Intercept TCP traffic
cat << "EOF" > /etc/nftables.d/tor.sh
TOR_CHAIN="dstnat_$(uci -q get firewall.tcp_int.src)"
TOR_RULE="$(nft -a list chain inet fw4 ${TOR_CHAIN} \
| sed -n -e "/Intercept-TCP/p")"
nft replace rule inet fw4 ${TOR_CHAIN} \
handle ${TOR_RULE##* } \
fib daddr type != { local, broadcast } ${TOR_RULE}
EOF
uci -q delete firewall.tor_nft
uci set firewall.tor_nft="include"
uci set firewall.tor_nft.path="/etc/nftables.d/tor.sh"
uci -q delete firewall.tcp_int
uci set firewall.tcp_int="redirect"
uci set firewall.tcp_int.name="Intercept-TCP"
uci set firewall.tcp_int.src="adapter3Zone"
uci set firewall.tcp_int.src_dport="0-65535"
uci set firewall.tcp_int.dest_port="9040"
uci set firewall.tcp_int.proto="tcp"
uci set firewall.tcp_int.family="any"
uci set firewall.tcp_int.target="DNAT"
 
