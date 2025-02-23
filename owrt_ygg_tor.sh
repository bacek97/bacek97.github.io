#/* -------------------"THE Cola-WARE LICENSE" (Revision 21):-------------------
# * <kostin.vasiliy97@gmail.com> wrote this code.
# * As long as you complies with Google Style guidelines, you can do whatever 
# * you want with this stuff. If we meet someday, and you think this stuff is
# * worth it, you can buy me a Cola in return.                    Vasilii Kostin
# * ------------------------------------------------------------------------- */

# Download OpenWRT-x64
# https://downloads.openwrt.org/releases/24.10.0/targets/x86/64/openwrt-24.10.0-x86-64-generic-squashfs-combined.img.gz

# Unpack downloaded archive

# Convert .img to .vdi
# "C:\Program Files\Oracle\VirtualBox\VBoxManage" convertfromraw --format VDI OPENWR~1.IMG openwrt.vdi

# Create new VBox machine and set 3 network adapters: 
# 1. Виртуальный адаптер хоста      (будет использоваться для SSH и Luci)
# 2. NAT                            (будет использоваться для прямого доступа в инетрнет самим роутером)
# 3. Внутренняя сеть                (будет использоваться для подключения других vbox машин)

# Setting for connect to SSH
# uci set network.lan.ipaddr='192.168.56.2'; uci commit; service network restart

# Download and run this script
# wget http://bacek97.github.io/owrt_ygg_tor.sh
# sh ./owrt_ygg_tor.sh


opkg update
opkg install luci-i18n-base-ru luci-i18n-tor-ru luci-proto-yggdrasil

# /etc/config/dhcp
uci set dhcp.adapter3=dhcp
uci set dhcp.adapter3.interface='adapter3'
uci set dhcp.adapter3.start='100'
uci set dhcp.adapter3.limit='150'
uci set dhcp.adapter3.leasetime='12h'
# /etc/config/network
uci set network.adapter3=interface
uci set network.adapter3.proto='static'
uci set network.adapter3.device='eth2'
uci set network.globals.packet_steering='1'
uci set network.adapter3.ipaddr='192.168.3.1'
uci set network.adapter3.netmask='255.255.255.0'

uci add firewall zone # =cfg0fdc81
uci set firewall.@zone[-1].name='adapter3Zone'
uci set firewall.@zone[-1].input='ACCEPT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='ACCEPT'
uci add_list firewall.@zone[-1].network='adapter3'

YGGCONF=$(yggdrasil -genconf -json)
uci set network.ygg=interface
uci set network.ygg.proto='yggdrasil'
uci set network.ygg.private_key=$(echo "$YGGCONF" | jsonfilter -e '@.PrivateKey')
uci set network.ygg.public_key=$(echo "$YGGCONF" | yggdrasil -useconf -publickey)
uci add_list firewall.$(uci show firewall | grep wan6 | grep -o "@zone\[\d]").network='ygg';
uci commit network
service network restart
# https://github.com/yggdrasil-network/public-peers/blob/master/europe/russia.md
# https://publicpeers.neilalexander.dev/
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://srv.itrus.su:7993'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://195.2.74.155:7994'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://195.58.51.167:7994'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://kzn1.neonxp.ru:7994'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://kursk.cleverfox.org:15015'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://ip4.01.tom.ru.dioni.su:9002'
uci add network yggdrasil_ygg_peer
uci set network.@yggdrasil_ygg_peer[-1].address='quic://ip4.01.ekb.ru.dioni.su:9002'

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

UseBridges 1
# https://howto.yggno.de/yggdrasil:sites_and_services:other_network_services
Bridge [21b:321:3243:ecb6:a4cf:289c:c0f1:d6eb]:16728 835FFE642EFA3BB7936663D2365A15D319FB6226
Bridge [21f:5234:5548:31e5:a334:854b:5752:f4fc]:9770 6C4C89ABE4D06987AB1F51C06939410282A1BF58
Bridge [224:6723:7ae0:5655:e600:51c9:4300:a2fb]:9001 F873E91048B40656694BE94ACAB6F0D32CAF8E17

# ExitNodes 185.40.4.
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
uci commit firewall
service firewall restart
