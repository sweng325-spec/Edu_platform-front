import { useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, Bell, BookOpen } from 'lucide-react';

import { coursesApi } from '../api/courses';

import { AuthContext } from '../context/AuthContext';

import { getLatestUnseenAnnouncement } from '../utils/announcementNotifications';

import { fetchAnnouncementsForCourses } from '../utils/fetchCourseAnnouncements';

import { extractCoursesList, getCourseImageUrl } from '../utils/media';



export default function MyCoursesPage() {

  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [announcementsByCourse, setAnnouncementsByCourse] = useState({});



  useEffect(() => {

    if (!user?.id) return;



    let mounted = true;



    const fetchMyCourses = async () => {

      setLoading(true);

      try {

        const response = await coursesApi.getmyCourses(user.id);

        const courseList = extractCoursesList(response?.data);

        if (!mounted) return;



        setCourses(courseList);

        const announcementsMap = await fetchAnnouncementsForCourses(courseList);

        if (mounted) {

          setAnnouncementsByCourse(announcementsMap);

        }

      } catch {

        if (mounted) {

          setCourses([]);

          setAnnouncementsByCourse({});

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };



    fetchMyCourses();



    return () => {

      mounted = false;

    };

  }, [user?.id]);



  return (

    <div className="mx-auto max-w-6xl space-y-6 pb-10">

      <section className="rounded-[30px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-8">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]">Student area</p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">My courses</h1>

            <p className="mt-2 max-w-xl text-sm text-emerald-50/90">

              Open a course to view announcements, materials, and your learning path.

            </p>

          </div>


        </div>

      </section>



      <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900">

        {loading ? (

          <p className="text-slate-600 dark:text-slate-300">Loading your courses...</p>

        ) : courses.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40">

            <BookOpen className="mx-auto h-8 w-8 text-emerald-700" />

            <p className="mt-3 font-semibold text-slate-900 dark:text-white">You have not enrolled in any courses yet.</p>

            <Link to="/courses" className="mt-4 inline-flex text-sm font-semibold text-[#16623f]">

              Browse courses

            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {courses.map((course) => {

              const imageUrl = getCourseImageUrl(course);

              const courseAnnouncements = announcementsByCourse[String(course.id)] || [];

              const unseenAnnouncement = getLatestUnseenAnnouncement(

                user.id,

                course.id,

                courseAnnouncements,

              );



              return (

                <article

                  key={course.id}

                  className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"

                >

                  <div className="relative h-32 bg-gradient-to-br from-[#174f3b] via-[#286b4d] to-[#99be70]">

                    {imageUrl && (

                      <img

                        src={imageUrl}

                        alt={course.title}

                        className="absolute inset-0 h-full w-full object-cover"

                        onError={(event) => {

                          event.currentTarget.style.display = 'none';

                        }}

                      />

                    )}

                  </div>

                  <div className="p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Enrolled course</p>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{course.title}</h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">

                      {course.description}

                    </p>



                    {unseenAnnouncement && (

                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">

                        <div className="flex items-start gap-2">

                          <span className="mt-0.5 rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-950 dark:text-amber-200">

                            <Bell className="h-3.5 w-3.5" />

                          </span>

                          <div className="min-w-0">

                            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">

                              New announcement

                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">

                              {unseenAnnouncement.title}

                            </p>

                          </div>

                        </div>

                      </div>

                    )}



                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">

                      <span className="text-sm text-slate-500 dark:text-slate-400">

                        {course.teacher_name || 'Daltex instructor'}

                      </span>

                      <Link

                        to={`/my-courses/${course.id}`}

                        className="inline-flex items-center gap-1 rounded-xl bg-[#16623f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#104d32]"

                      >

                        Open <ArrowRight className="h-4 w-4" />

                      </Link>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        )}

      </section>

    </div>

  );

}

