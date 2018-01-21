---
title: Boot physical Windows inside Qemu guest machine
slug: boot-physical-windows-inside-qemu-guest-machine
tags: linux, qemu, kvm, windows
---

Recently, I needed to set up a new Windows system for use in an Internship
project. Like the old setup which was described in an [older post], I needed to
have access to the same Windows from inside _Qemu_ and from dual-boot for
performance reasons. But instead of requiring to install Windows two times
(once directly on PC as host and the other inside _Qemu_) which caused some
issues including slow filesystem operations when booting as the host system, I
did an update to setup instructions this time.

For the virtual machine, we will use *Qemu/KVM* with *Ovmf* EFI bios.

First, Install Windows directly on your PC then reboot back to Linux. Check
that ``loop`` and ``linear`` modules are loaded:

```shell
sudo modprobe loop
sudo modprobe linear
```

Now, we need to create a virtual RAID disk for _Qemu_ that will hold our physical
Windows partition. As we will use GPT partitions table schema, we will allocate
few megabytes ``efi1`` for GPT metadata (34 Sectors) and for EFI partition
before Windows partition and one megabyte ``efi2`` after Windows partition for
GPT secondary metadata (even we need just 34 Sectors, we will use one megabyte
for best RAID performance)

```shell
dd if=/dev/zero of=efi1 bs=1M count=100
dd if=/dev/zero of=efi2 bs=1M count=1
```

Now that we have ``efi1`` file of 100 MB (100 * 1M) and ``efi2`` of 1 MB. Next,
we create loopback devices from both files:

```shell
sudo losetup -f efi1
sudo losetup -f efi2
```

We will assume that the assigned devices are ``/dev/loop0`` and ``/dev/loop1``
for ``efi1`` and ``efi2`` respectively. To check the assigned devices, type:

```shell
losetup -a
```

Next, we will merge the loopback devices and the real Windows partition into a
single linear RAID disk image (We will assume that the windows partition is
``/dev/sda2``):

```shell
sudo mdadm --build --verbose /dev/md0 --chunk=512 --level=linear --raid-devices=3 /dev/loop0 /dev/sda2 /dev/loop1
```

Time to create the partitions table of the new RAID disk reusing the same
physical Windows partition. For this step, we will use *parted* utility. You
can use another tool of your choice.

Partition your virtual RAID disk:

```shell
sudo parted /dev/md0
(parted) unit s
(parted) mktable gpt
(parted) mkpart primary fat32 2048 204799    # depends on size of efi1 file
(parted) mkpart primary ntfs 204800 -2049    # depends on size of efi1 and efi2 files
(parted) set 1 boot on
(parted) set 1 esp on
(parted) set 2 msftdata on
(parted) name 1 EFI
(parted) name 2 Windows
(parted) quit
```

Your final layout will have 2 partitions; Windows partition ``/dev/md0p2`` and
EFI partition ``/dev/md0p1``. The EFI partition needs to be formatted.

```shell
sudo mkfs.msdos -F 32 -n EFI /dev/md0p1
```

Now let add Windows boot entry to the virtual RAID disk.

Boot to Windows live DVD from inside _Qemu_ virtual machine with ``/dev/md0`` as
disk after changing ``/dev/md0`` owner to the current user and installing
*Ovmf* EFI bios, which in my case, it is available at
``/usr/share/ovmf/ovmf_x64.bin``.

```shell
chown $USER:$USER /dev/md0  # We need to change the owner of md0
qemu-system-x86_64 \
    -bios /usr/share/ovmf/ovmf_x64.bin \
    -drive file=/dev/md0,media=disk,format=raw \
    -cpu host -enable-kvm -m 2G \
    -cdrom /path/to/windows.iso
```

Press ``Shift+F10`` when Windows installer starts to open the terminal. We need
to assign a letter to EFI volume (partition).

```shell
diskpart
DISKPART> list disk
DISKPART> select disk 0    # Select the disk
DISKPART> list volume      # Find EFI volume (partition) number
DISKPART> select volume 2  # Select EFI volume
DISKPART> assign letter=B  # Assign B: to EFI volume
DISKPART> exit
```

Finally, we create BCD boot entry for Windows partition on the same terminal.

```shell
bcdboot C:\Windows /s B: /f ALL
```

Now, you are ready to boot to Windows from inside _Qemu_.

```shell
qemu-system-x86_64 \
    -bios /usr/share/ovmf/ovmf_x64.bin \
    -drive file=/dev/md0,media=disk,format=raw \
    -cpu host -enable-kvm -m 2G
```

After each Linux system reboot, you need to create the loopback devices, merge
the partitions into the RAID disk and change the owner of the device before
launching the virtual machine. You can find [the script I use] as a reference.

Credit to [Arch Linux Wiki]. Enjoy!

[older post]: /post/dualboolt-guest-window-machine
[Arch Linux Wiki]: https://wiki.archlinux.org/index.php/QEMU#Simulate_virtual_disk_with_MBR_using_linear_RAID
[the script I use]: https://github.com/lejenome/dotfiles/blob/master/bin/ws
