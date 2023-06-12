import { useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
const gProvider = new GoogleAuthProvider();


import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

import { useAuth } from "@/context/authContext";
import Loader from "@/components/Loader";
import { profileColors } from "@/utils/constants";
import ToastMessage from "@/components/ToastMessage";
import { IoLogoGoogle, IoLogoFacebook } from "react-icons/io";
import Link from "next/link";
import { toast } from "react-toastify";

const Register = () => {
    const router = useRouter();
    const { currentUser, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && currentUser) {
            router.push("/");
        }
    }, [currentUser, isLoading,router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const file = e.target[3]?.files?.[0];
        const colorIndex = Math.floor(Math.random() * profileColors.length);
        
        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            if (file) {
                const storageRef = ref(storage, displayName);
                const uploadTask = uploadBytesResumable(storageRef, file);
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100;
                        console.log("Upload is " + progress + "% done");
                        switch (snapshot.state) {
                            case "paused":
                                console.log("Upload is paused");
                                break;
                            case "running":
                                console.log("Upload is running");
                                break;
                        }
                    },
                    (error) => {
                        toast.error("hello")
                        console.error(error.message);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            async (downloadURL) => {
                                await updateProfile(user, {
                                    displayName,
                                    photoURL: downloadURL,
                                });
                                console.log("File available at", downloadURL);

                                await setDoc(doc(db, "users", user.uid), {
                                    uid: user.uid,
                                    displayName,
                                    email,
                                    photoURL: downloadURL,
                                    color: profileColors[colorIndex],
                                });

                                await setDoc(
                                    doc(db, "userChats", user.uid),
                                    {}
                                );

                                router.push("/");
                            }
                        );
                    }
                );
            } else {
                await updateProfile(user, {
                    displayName,
                });
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    displayName,
                    email,
                    color: profileColors[colorIndex],
                });
                await setDoc(doc(db, "userChats", user.uid), {});
                router.push("/");
            }
        } catch (error) {
            console.error(error);
        }
    };


    return isLoading || (!isLoading && !!currentUser) ? (
        <Loader />
    ) : (
        <div className="h-[100vh] flex justify-center items-center bg-c1">
            <div className="flex items-center flex-col">
                <div className="text-center">
                    <div className="text-4xl font-bold">Create New Account</div>
                    <div className="mt-3 text-c3">
                        Connect and chat with anyone, anywhere
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-3 w-[500px] mt-5"
                >
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
                        autoComplete="off"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
                        autoComplete="off"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
                        autoComplete="off"
                        required
                    />
                    <button className="mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        Sign Up
                    </button>
                </form>
                <div className="flex justify-center gap-1 text-c3 mt-5">
                    <span>Already have an account?</span>
                    <Link
                        href="/login"
                        className="font-semibold text-white underline underline-offset-2 cursor-pointer"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
